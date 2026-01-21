type MessageResponse = {
  message: string;
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type UserDeleteResponse = MessageResponse & {
  user: { user_id: number };
};

type AvailableResponse = Partial<MessageResponse> & {
  available?: boolean;
};

type BooleanResponse = MessageResponse & {
  success: boolean;
};


export type {MessageResponse, ErrorResponse, UserDeleteResponse, AvailableResponse, BooleanResponse};