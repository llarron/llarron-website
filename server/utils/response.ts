import { NextResponse } from 'next/server';

export const sendSuccess = (data: any, message = 'Success', status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

export const sendError = (message = 'Error', code = 'UNKNOWN_ERROR', status = 500, errors?: any) => {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      errors,
    },
    { status }
  );
};
