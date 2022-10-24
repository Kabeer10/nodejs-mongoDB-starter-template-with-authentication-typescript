type OtpPurpose = "PHONE_VERIFICATION" | "LOGIN" | "RESET_PASSWORD";

type TokenPayload = {
  _id: string;
  username: string;
  emailVerified: boolean;
  purpose?: string;
  isDeleted: boolean;
};

type Gender = "Male" | "Female" | "Other";
