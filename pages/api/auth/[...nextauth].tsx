import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions, getUser, hashPassword } from "../../../src/auth";

const nxauth = NextAuth(authOptions);

export default nxauth;
