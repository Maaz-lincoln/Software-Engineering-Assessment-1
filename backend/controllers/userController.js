const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const { generateToken, isValidEmail } = require("../utils/tokenUtils");
const { generateOTP } = require("../utils/otpUtils");
const handleError = require("../utils/errorHandler");
const moment = require("moment");
/* Sign Up */
const signup = asyncHandler(async (req, res) => {
  const { email, password, userName, phone } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ errors: "Invalid email format" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ errors: "User with this email already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      email,
      userName,
      password: hashedPassword,
      phone,
      userType: "a2d%lsakd4A",
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: {
        email,
        id: user._id.toString(),
        token,
        userName: userName || "",
        phone: user.phone || "",
        userType: user.userType,
        staus: user.status,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    res.status(501).json({
      success: true,
      message: "Something went wrong!",
    });
  }
});

/* Login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ errors: "Invalid email format" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, errors: "Incorrect credentials!" });
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return res
      .status(400)
      .json({ success: false, errors: "Incorrect credentials!" });
  }

  const token = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    message: "User logged in successfully!",
    data: {
      name: user.name,
      email,
      id: user._id.toString(),
      token,
      userType: user.userType,
      userName: user.userName || "",
      phone: user.phone || "",
      staus: user.status,
      profileImage: user.profileImage || "",
    },
  });
});

/* Logout */
const logout = (req, res) => {
  const token = req.headers.authorization;
  console.log(token, "token");
};

/* Change Password */
const changePassword = asyncHandler(async (req, res) => {
  const { old_password, current_password, password_confirmation } = req.body;

  if (!old_password || !current_password || !password_confirmation) {
    return res
      .status(400)
      .json({ success: false, errors: "All fields are required" });
  }

  if (
    current_password.length < 8 ||
    current_password !== password_confirmation
  ) {
    return res
      .status(400)
      .json({ success: false, errors: "Invalid password criteria" });
  }

  if (current_password === old_password) {
    return res.status(400).json({
      success: false,
      errors: "The new password must not match the old password",
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, errors: "User not found" });
  }

  const passwordMatch = await bcrypt.compare(old_password, user.password);
  if (!passwordMatch) {
    return res
      .status(400)
      .json({ success: false, errors: "Incorrect old password" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(current_password, salt);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/* Delete User */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    await User.findByIdAndDelete(req.user.id);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(501).json({
      success: true,
      message: "Something went wrong!",
    });
  }
});

/* Send OTP */
const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, errors: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        errors: "User not found with this email address",
      });
    }

    const otp = generateOTP();
    const userOtp = await Otp.findOne({ email });
    if (userOtp) {
      userOtp.otp = otp;
      await userOtp.save();
      return res
        .status(200)
        .json({ success: true, message: "Opt resend successfully" });
    }

    const otpCreated = await Otp.create({ email, otp: String(otp) });

    /* Email Sent here using nodemailer */
    // await sendOTPEmail(email,otp);

    if (otpCreated) {
      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully" });
    }
  } catch (error) {
    console.error("Error in sendOTP:", error); // Log the error for debugging

    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
});

/* Verify OTP */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, errors: "Email and OTP are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, errors: "User not found" });
  }

  const otpUser = await Otp.findOne({ email });

  if (otp !== otpUser.otp) {
    return res.status(400).json({ success: false, errors: "Incorrect OTP" });
  }

  res.status(200).json({ success: true, message: "OTP verified successfully" });
});

/* Reset Password */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, new_password } = req.body;

  if (!email || !otp || !new_password) {
    return res
      .status(400)
      .json({ success: false, errors: "All fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, errors: "User not found" });
  }

  const otpUser = await Otp.findOne({ email });

  if (otp !== otpUser.otp) {
    return res.status(400).json({ success: false, errors: "Invalid OTP" });
  }

  if (new_password.length < 8) {
    return res.status(400).json({
      success: false,
      errors: "Password must be at least 8 characters",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(new_password, salt);

  user.password = hashedPassword;
  await user.save();

  await Otp.deleteOne({ email });
  res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();

    const totalUsers = users.length;

    const thisMonth = moment().startOf("month");
    const thisWeek = moment().startOf("week");

    const thisMonthUsers = users.filter((user) =>
      moment(user.createdAt).isSameOrAfter(thisMonth)
    ).length;
    const thisWeekUsers = users.filter((user) =>
      moment(user.createdAt).isSameOrAfter(thisWeek)
    ).length;
    const deactivatedUsers = users.filter(
      (user) => user.status === "deactive"
    ).length;

    const statistics = [
      {
        title: "This Week",
        numberOfUsers: thisWeekUsers,
      },
      {
        title: "This Month",
        numberOfUsers: thisMonthUsers,
      },
      {
        title: "Total Users",
        numberOfUsers: totalUsers,
      },
      {
        title: "Deactivated Users",
        numberOfUsers: deactivatedUsers,
      },
    ];

    res.status(200).json({ success: true, data: users, statistics });
  } catch (error) {
    handleError(res, 400, "Something went wrong");
  }
});
// Change User Status
const changeUserStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "deactive"].includes(status)) {
      return handleError(res, 400, "Invalid status value");
    }

    const user = await User.findById(id);

    if (!user) {
      return handleError(res, 404, "User not found");
    }

    user.status = status;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    handleError(res, 400, "Something went wrong");
  }
});

const updateUserInfo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { userName } = req.body;
  const profileImage = req.file ? req.file.filename : undefined;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return handleError(res, 404, "User not found");
    }

    if (userName) user.userName = userName;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User info updated successfully",
      data: {
        userName: user.userName,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    handleError(res, 400, "Something went wrong");
  }
});

const checkUserExists = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, errors: "Invalid or missing email format" });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(404)
        .json({ success: false, errors: "User already exists" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "User with this email not exists" });
    }
  } catch (error) {
    handleError(res, 500, "Something went wrong");
  }
});

module.exports = {
  signup,
  login,
  logout,
  changePassword,
  deleteUser,
  sendOTP,
  verifyOTP,
  resetPassword,
  getAllUsers,
  changeUserStatus,
  updateUserInfo,
  checkUserExists,
};
