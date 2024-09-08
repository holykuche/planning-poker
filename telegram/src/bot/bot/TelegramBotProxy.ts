import BlueBirdPromise from 'bluebird';
import TelegramBot, {
  ChatId,
  SendMessageOptions,
  Message,
  ConstructorOptions,
} from 'node-telegram-bot-api';

type MessageResolvedHandler = (message: Message) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageRejectedHandler = (reason: any) => void;

interface MessageQueueItem {
  chatId: ChatId;
  text: string;
  options?: SendMessageOptions;
  resolve: MessageResolvedHandler;
  reject: MessageRejectedHandler;
}

export default class TelegramBotProxy extends TelegramBot {
  private messageQueue: MessageQueueItem[];
  private inUseMessageQueue: MessageQueueItem[];

  constructor(token: string, options?: ConstructorOptions) {
    super(token, options);

    this.sendMessage = this.sendMessage.bind(this);
    this.sendMessages = this.sendMessages.bind(this);

    this.messageQueue = [];
    this.inUseMessageQueue = [];
  }

  sendMessage(
    chatId: ChatId,
    text: string,
    options?: SendMessageOptions
  ): Promise<Message> {
    let resolve: MessageResolvedHandler;
    let reject: MessageRejectedHandler;

    const promise = new Promise<Message>((promiseResolve, promiseReject) => {
      resolve = promiseResolve;
      reject = promiseReject;
    });

    this.messageQueue.push({chatId, text, options, resolve, reject});
    process.nextTick(this.sendMessages);

    return promise;
  }

  private sendMessages(): void {
    if (this.inUseMessageQueue.length || !this.messageQueue.length) {
      return;
    }

    this.inUseMessageQueue = this.messageQueue;
    this.messageQueue = [];

    BlueBirdPromise.mapSeries(this.inUseMessageQueue, request => {
      const {chatId, text, options, resolve, reject} = request;
      return super
        .sendMessage(chatId, text, options)
        .then(resolve)
        .catch(reject);
    }).then(() => {
      this.inUseMessageQueue = [];
      this.sendMessages();
    });
  }
}
