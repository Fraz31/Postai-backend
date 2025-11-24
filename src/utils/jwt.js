import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ACCESS_TOKEN_EXPIRES_IN = '2h';
// TODO: make refresh token lifetime configurable via env if needed
const REFRESH_TOKEN_EXPIRES_IN = '14d'; // between 7-30 days as requested

export function generateAccessToken(userId) {
  return jwt.sign(
    {
      sub: userId,
      type: 'access'
    },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    }
  );
}

export function generateRefreshToken(userId) {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh'
    },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function generateTokenPair(userId) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
}
