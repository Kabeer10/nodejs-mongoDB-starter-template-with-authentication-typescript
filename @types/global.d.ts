type OtpPurpose = "EMAIL_VERIFICATION" | "LOGIN" | "RESET_PASSWORD";

type TokenPayload = {
  _id: string;
  username: string;
  emailVerified: boolean;
  purpose?: string;
  isDeleted: boolean;
  createdAt: Date;
};

type Gender = "Male" | "Female" | "Other";
