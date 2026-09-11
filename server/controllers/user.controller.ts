import { UserService } from '@/server/services/user.service';
import { sendSuccess, sendError } from '@/server/utils/response';
import { SignupSchema } from '@/server/validators/user.validator';
import { HTTP_STATUS, ERROR_CODES } from '@/server/config/constants';
import { NextRequest } from 'next/server';
import { logger } from '@/server/utils/logger';

export class UserController {
  constructor(private service: UserService) {}

  async signup(req: NextRequest) {
    try {
      const body = await req.json();
      const validationResult = SignupSchema.safeParse(body);

      if (!validationResult.success) {
        logger.warn({ event: 'SIGNUP_VALIDATION_FAILED' }, 'Signup validation failed');
        return sendError('Please check your details and try again. Some information seems to be missing or incorrect.', ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, validationResult.error.format());
      }

      const clientIp =
        req.headers.get('x-forwarded-for') ||
        (req as unknown as { ip?: string }).ip ||
        undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const result = await this.service.registerUser(validationResult.data, clientIp, userAgent);

      return sendSuccess(result, 'Your information has been successfully saved. Thank you!', result.status === 'new' ? HTTP_STATUS.CREATED : HTTP_STATUS.OK);
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (error instanceof SyntaxError) {
        logger.warn({ event: 'MALFORMED_JSON_PAYLOAD' }, 'Malformed JSON payload in signup request');
        return sendError('We received an invalid request format. Please try submitting again.', ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
      }
      if (err?.message === 'USER_CONFLICT') {
        logger.warn({ event: 'USER_CONFLICT' }, 'User details conflict with existing accounts');
        return sendError(
          'The details provided conflict with an existing enquiry. Please check your details and try again or reach out to us directly.',
          ERROR_CODES.USER_CONFLICT,
          HTTP_STATUS.CONFLICT
        );
      }
      if (err?.message === 'USER_ALREADY_EXISTS') {
        logger.warn({ event: 'USER_ALREADY_EXISTS' }, 'User already exists');
        return sendError('It looks like you already have an account with this email or phone number.', ERROR_CODES.USER_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
      }
      logger.error({ event: 'SIGNUP_INTERNAL_ERROR', errorCode: err?.code || 'UNKNOWN' }, 'Internal error during signup');
      return sendError('Something went wrong while submitting your enquiry. Please try again later.', ERROR_CODES.UNKNOWN_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
