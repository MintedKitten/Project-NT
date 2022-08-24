export interface userprofiletokenInt {
  userId: number | null;
  sub: number | null;
  iat: number | null;
  profile: userprofileInt | null;
}

export interface userprofileInt {
  username: string;
}

