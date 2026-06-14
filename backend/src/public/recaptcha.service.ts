import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GoogleRecaptchaResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
  constructor(private readonly configService: ConfigService) {}

  async verify(token?: string) {
    if (!token) {
      throw new BadRequestException('reCAPTCHA token is required');
    }

    const secret = this.configService.get<string>('RECAPTCHA_SECRET_KEY');

    console.log('RECAPTCHA_SECRET_KEY:', secret);

    if (!secret) {
      throw new BadRequestException('reCAPTCHA secret key is missing');
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = (await res.json()) as GoogleRecaptchaResponse;

    if (!data.success) {
      throw new BadRequestException('reCAPTCHA verification failed');
    }

    return true;
  }
}