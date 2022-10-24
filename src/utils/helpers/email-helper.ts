import nodeMailer from "nodemailer";
import { Env } from "../../config";
import { User } from "../../models";
import generateRandomCode from "./generate-random-code";

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: Env.GMAIL_EMAIL,
    pass: Env.GMAIL_PASS,
  },
});

function generateEmail(email: string, subject: string, template: string) {
  return {
    from: `"no-reply" <${Env.GMAIL_EMAIL}>`, // sender address
    to: email,
    subject,
    html: template,
  };
}

async function sendEmail(email: string, subject: string, template: string) {
  try {
    const msg = generateEmail(email, subject, template);
    await transporter.sendMail(msg);
  } catch (err: any) {
    throw new Error(err.message);
  }
}

async function sendEmailOtp(
  email: string,
  username: string,
  purpose: OtpPurpose
) {
  const code = generateRandomCode(6);
  try {
    await sendEmail(email, purpose, `<h1>${code} ${username}</h1>`);

    await User.findOneAndUpdate(
      { username },
      { sms: { code, expires: new Date(Date.now() + 300000), purpose } }
    );
    return true;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

async function verifyOtp(code: string, username: string, purpose: OtpPurpose) {
  try {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.sms) {
      throw new Error("No OTP found");
    }

    if (
      user.sms.code === code &&
      user.sms.purpose === purpose &&
      user.sms.expires > new Date()
    ) {
      user.sms.code = "";
      await user.save();
      return true;
    }
    throw new Error("Invalid OTP");
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export { sendEmail, sendEmailOtp, verifyOtp };
