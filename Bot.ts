interface InlineKeyboardMarkup {
    inline_keyboard: Array<InlineKeyboardButton[]>
}

interface InlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
    callback_game?: object; // ToDo: Добавить инфо о CallbackGame
    pay?: boolean;
}

interface LoginUrl {
    url: string;
    forward_text?: string;
    bot_username?: string;
    request_write_access?: boolean;
}

interface Update {
    update_id: number;
    message: Message;
    edited_message: Message;
    channel_post: Message;
    edited_channel_post: Message;
    inline_query: object;
    chosen_inline_result: object;
    callback_query: object;
    shipping_query: object;
    pre_checkout_query: object;
    poll: object;
    poll_answer: object;
}

interface Message {
    message_id: number;
    from?: User;
    date: number;
    chat: Chat;
    forward_from?: User;
    forward_from_chat?: Chat;
    forward_from_message_id?: number;
    forward_signature?: string;
    forward_sender_name?: string;
    forward_date?: number;
    reply_to_message?: Message;
    via_bot?: User;
    edit_date?: number;
    media_group_id?: string;
    author_signature?: string;
    text?: string;
    entities?: Array<MessageEntity>;
    animation?: Animation;
    audio?: Audio;
    document?: Document;
    photo?: Array<PhotoSize>;
    sticker?: Sticker;
    video?: object;
    video_note?: object;
    voice?: object;
    caption?: string;
    caption_entities?: Array<MessageEntity>;
    contact?: object;
    dice?: object;
    game?: object;
    poll?: object;
    venue?: object;
    location?: object;
    new_chat_members?: Array<User>;
    left_chat_member?: User;
    new_chat_title?: string;
    new_chat_photo?: Array<PhotoSize>;
    delete_chat_photo?: boolean;
    group_chat_created?: boolean;
    supergroup_chat_created?: boolean;
    channel_chat_created?: boolean;
    migrate_to_chat_id?: number;
    migrate_from_chat_id?: number;
    pinned_message?: Message;
    invoice?: object;
    successful_payment?: object;
    connected_website?: string;
    passport_data?: object;
    reply_markup?: InlineKeyboardMarkup;
}

interface MessageEntity {
    type: string;
    offset: number;
    length: number;
    url?: string;
    user?: User;
    language?: string;
}

interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
}

interface Chat {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo?: object;
    description?: string;
    invite_link?: string;
    pinned_message?: Message;
    permissions?: object;
    slow_mode_delay?: number;
    sticker_set_name?: string;
    can_set_sticker_set?: boolean;
}

interface PhotoSize {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
}

interface Animation {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    duration: number;
    thumb?: PhotoSize;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
}

interface Audio {
    file_id?: string;
    file_unique_id?: string;
    duration?: number;
    performer?: string;
    title?: string;
    mime_type?: string;
    file_size?: number;
    thumb?: PhotoSize;
}

interface Sticker {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    is_animated: boolean;
    thumb?: PhotoSize;
    emoji?: string;
    set_name?: string;
    mask_position?: object;
    file_size?: number;
}

/**
 * Media: File to send.
 * Pass a file_id to send a file that exists on the Telegram servers (recommended),
 * pass an HTTP URL for Telegram to get a file from the Internet,
 * or pass “attach://<file_attach_name>” to upload a new one using
 * multipart/form-data under <file_attach_name> name.
 * https://core.telegram.org/bots/api#sending-files
 */
interface InputMediaPhoto {
    type: string; // must be "photo"
    media: string;
    caption?: string;
    parse_mode?: string;
}

// ToDo: Add https://core.telegram.org/bots/api#inputmediavideo
// ToDo: Add https://core.telegram.org/bots/api#inputmediaanimation
// ToDo: Add https://core.telegram.org/bots/api#inputmediaaudio
// ToDo: Add https://core.telegram.org/bots/api#inputmediadocument

var token_: string;
var username_: string;
var handlers_ = {
    'commands': [],
    'messages': []
};

function setToken(token) {
    token_ = token
}

function setUsername(username) {
    username_ = username
}

function get_(method: string, params: object = {}): object | void {
    if (token_) {
        let queryParams = Object.entries(params).map(param => param[0] + '=' + param[1]).join('&');
        if (queryParams !== '')
            queryParams = '?' + queryParams;
        const data = {'muteHttpExceptions': false};
        if (params['muteHttpExceptions'] !== undefined) {
            data.muteHttpExceptions = params['muteHttpExceptions'];
            delete params['muteHttpExceptions'];
        }
        return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token_ + '/' + method + queryParams, data).getContentText())
    } else
        throw new Error('Token is undefined!')
}

function post_(method: string, payload: any): object | void {
    if (token_) {
        payload.method = method;
        let data = {
            'method': 'post',
            'payload': payload,
            'muteHttpExceptions': payload['muteHttpExceptions'] || false
        };
        delete payload['muteHttpExceptions'];
        return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token_ + '/', data).getContentText())
    } else
        throw new Error('Token is undefined!')
}

/**
 * A simple method for testing your bot's auth token.
 * Requires no parameters.
 * Returns basic information about the bot in form of a User object
 */
function getMe() {
    return get_('getMe')
}

/**
 * Use this method to send text messages. On success, the sent Message is returned.
 * @param params
 */
function sendMessage(params: {
    chat_id: string | number,
    text: string,
    parse_mode?: string,
    disable_web_page_preview?: boolean,
    disable_notification?: boolean,
    reply_to_message_id?: number,
    reply_markup?: string | object // ToDo: Расписать возможные объекты
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    if (params.reply_markup && typeof params.reply_markup === 'object')
        params.reply_markup = JSON.stringify(params.reply_markup);
    return post_('sendMessage', params)
}

/**
 * Use this method to forward messages of any kind. On success, the sent Message is returned.
 * @param params
 */
function forwardMessage(params: {
    chat_id: string | number,
    from_chat_id: string | number,
    message_id: number,
    disable_notification?: boolean
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    if (typeof params.from_chat_id === 'number')
        params.from_chat_id = String(params.from_chat_id);
    return post_('forwardMessage', params)
}

/**
 * Use this method to send photos. On success, the sent Message is returned.
 * @param params
 */
function sendPhoto(params: {
    chat_id: string | number,
    photo: string | File,
    caption?: string,
    parse_mode?: string,
    disable_notification?: boolean,
    reply_to_message_id?: number,
    reply_markup?: string | object // ToDo: Расписать возможные объекты
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    if (params.reply_markup && typeof params.reply_markup === 'object')
        params.reply_markup = JSON.stringify(params.reply_markup);
    return post_('sendPhoto', params)
}

/**
 * 
 * @param params Media - A JSON-serialized array describing photos and videos to be sent,
 * must include 2-10 items
 */
function sendMediaGroup(params: {
    chat_id: string | number,
    media: string | object,
    disable_notification?: boolean,
    reply_to_message_id?: number
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    if (params.media && typeof params.media === 'object')
        params.media = JSON.stringify(params.media);
    return post_('sendMediaGroup', params)
}

function sendChatAction(params: {
    chat_id: string | number,
    action: string
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    return post_('sendChatAction', params)
}

function sendSticker(params: {
    chat_id: string | number,
    sticker: string | File,
    disable_notification?: boolean,
    reply_to_message_id?: number,
    reply_markup?: string | object
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    if (params.reply_markup && typeof params.reply_markup === 'object')
        params.reply_markup = JSON.stringify(params.reply_markup);
    return post_('sendChatAction', params)
}

/**
 * Use this method to delete a message, including service messages, with the following limitations:
 * - A message can only be deleted if it was sent less than 48 hours ago.
 * - A dice message in a private chat can only be deleted if it was sent more than 24 hours ago.
 * - Bots can delete outgoing messages in private chats, groups, and supergroups.
 * - Bots can delete incoming messages in private chats.
 * - Bots granted can_post_messages permissions can delete outgoing messages in channels.
 * - If the bot is an administrator of a group, it can delete any message there.
 * - If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there.
 * Returns True on success.
 */
function deleteMessage(params: {
    chat_id: string | number,
    message_id: number
}) {
    if (typeof params.chat_id === 'number')
        params.chat_id = String(params.chat_id);
    return post_('deleteMessage', params)
}

/**
 * Use this method to specify a url and receive incoming updates via an outgoing webhook.
 * Whenever there is an update for the bot, we will send an HTTPS POST request to the specified url,
 * containing a JSON-serialized Update.
 * In case of an unsuccessful request, we will give up after a reasonable amount of attempts.
 * Returns True on success. 
 * If you'd like to make sure that the Webhook request comes from Telegram,
 * we recommend using a secret path in the URL, e.g. https://www.example.com/<token>. 
 * Since nobody else knows your bot's token, you can be pretty sure it's us.
 * @param params 
 */
function setWebhook(params: {
    url: string,
    certificate?: File,
    max_connections?: number,
    allowed_updates?: string[]
}) {
    return get_('setWebhook', params)
}

/**
 * Use this method to remove webhook integration if you decide to switch back to getUpdates.
 * Returns True on success.
 * Requires no parameters.
 */
function deleteWebhook() {
    return get_('deleteWebhook')
}

/**
 * Use this method to get current webhook status.
 * Requires no parameters.
 * On success, returns a WebhookInfo object.
 * If the bot is using getUpdates, will return an object with the url field empty.
 */
function getWebhookInfo() {
    return get_('getWebhookInfo')
}

/**
 * Use this method to get information about a member of a chat.
 * Returns a ChatMember object on success.
 */
function getChat(params: {
    chat_id: string | number
}) {
    return get_('getChat', params)
}

/**
 * Use this method to get information about a member of a chat.
 * Returns a ChatMember object on success.
 */
function getChatMember(params: {
    chat_id: string | number,
    user_id: number
}) {
    return get_('getChatMember', params)
}

function onCommand(command: string, callback: Function, canArgs: boolean = false) {
    if (command.substring(0, 1) !== '/') {
        command = '/' + command
    }
    handlers_.commands.push({command, callback, canArgs})
}

function onMessage(message: string, callback: Function) {
    handlers_.messages.push({message, callback})
}

function onPost(e: any) {
    let update: Update = JSON.parse(e.postData.contents);
    let chat_id: number = update.message.chat.id;
    let text: string = update.message.text.trim();

    handlers_.commands.forEach(handler => {
        if (update.message.chat.type !== 'private') {
            if (handler.private)
                return;
            text = text.replace('@' + username_, '')
        }

        if (handler.canArgs) {
            if (text.substring(0, handler.command.length) === handler.command) {
                let args = text.substring(handler.command.length).trim();
                let argsArr = args === '' ? [] : args.split(' ');
                handler.callback(chat_id, update, argsArr, argsArr.length)
            }
        } else {
            if (text === handler.command) {
                handler.callback(chat_id, update)
            }
        }
    })

    handlers_.messages.forEach(handler => {
        if (text.search(handler.message) != -1) {
            handler.callback(chat_id, update)
        }
    })
}