import { sleep } from '~/lib/utils';

import { useNavigate } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '~/components/ui/input-otp';

import { Button } from './ui/button';

const JoinRoomDialog = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState<boolean>(false);

  const [roomId, setRoomId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className='text-base font-medium text-[#3E83DD]'
          variant='secondary'
        >
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-center text-3xl'>Join Room</DialogTitle>
          <DialogDescription className='flex flex-col items-center justify-center gap-4 py-12'>
            <InputOTP
              disabled={loading}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              size={100}
              value={roomId}
              onChange={async (newValue) => {
                setLoading(false);
                if (newValue.length === 6) {
                  setRoomId(newValue);
                  setLoading(true);
                  await sleep(1000);
                  setLoading(false);
                  setRoomId(undefined);
                  setOpen(false);
                  await navigate({
                    to: '/room/$roomId',
                    params: { roomId: newValue.toUpperCase() },
                  });
                } else {
                  setRoomId(newValue);
                }
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;
