class Slack {
    token!: string; // The API token for the Slack API.

    constructor() {
        this.token = env("SGRC_SLACK_BOT_TOKEN") ?? "";
    }


    /**
     * 
     * Generic function to send a request to the Slack API.
     * 
     * @param url The URL to send the request to.
     * @param params The parameters to send with the request.
     * @param method The method to use for the request.
     * @returns the response from the request.
     */
    _send_request(url: string, params: { [key: string]: string }, method: string) {

        // Add the parameters to the URL.
        url += "?";
        for (let key in params) {
            url += "&" + key + "=" + params[key];
        }

        // Set the options for the request
        let options: object = {
            method: method,
            headers: {
                Authorization: "Bearer " + this.token,
            },
        };

        // Send the request
        let response = UrlFetchApp.fetch(url, options);
        return response;
    }


    /**
     * This function is responsible for handling the interactivity of the Slack bot.
     * 
     * @param event the event object that is passed to the function.
     * @returns the result of the callback function.
     * 
     */
    handleInteractivity(event: GoogleAppsScript.Events.DoPost) {


        // Parse the payload to get the callback ID.
        let callbackId: string = JSON.parse(event.parameter.payload).callback_id
        let callbackFunction: { [key: string]: Function } = {
            "count_emoji": CountMoji.receiveMessage
        };

        return callbackFunction[callbackId](event);

    }


    /**
       * Sends either a plain text message or a rich text series of blocks via Slack
       * to a given user or channel. If sending to a channel, the bot must have been
       * manually added to that channel by a user in Slack first.
       * 
       * @param message the message to send.
       * @param slackId the user or channel ID for where to send the message.
       * @returns the response object from Slack.
       */
    sendMessage(message: string | object[], slackId: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
        let url: string = "https://slack.com/api/chat.postMessage";
        let payload: string = JSON.stringify({
            channel: slackId,
            blocks:
                typeof message == "string"
                    ? [Slack.blockComponents.plainText(message)]
                    : message,
        });

        let options: object = {
            method: "post",
            contentType: "application/json; charset=utf-8",
            headers: {
                Authorization: "Bearer " + this.token,
            },
            payload: payload,
        };

        let response = UrlFetchApp.fetch(url, options);
        return response;
    }


    /**
     * Retrieves the reactions on a given message option via the Slack API and returns the response.
     * 
     * @param message the message object that the reactions are being retrieved from.
     * @returns the response from the request containing information about the reactions on that message.
     */
    getReactions(message: { [key: string]: any }) {
        let response = this._send_request(
            "https://slack.com/api/reactions.get",
            {
                channel: message.channel.id,
                timestamp: message.message_ts,
            },
            "post"
        );

        return response;
    }


    getUserById(userId: string) {
        let response = this._send_request(
            "https://slack.com/api/users.profile.get",
            {
                user: userId,
            },
            "get"
        );

        return response;
    }


    /**
     * A header object linking to all underlying block types that can be used to
     * build richly formatted Slack messages.
     * https://api.slack.com/block-kit
     *
     * @readonly
     * @static
     * @memberof Slack
     */
    static get blockComponents() {
        return {
            plainText: Slack._plainText,
            sectionWithButton: Slack._sectionWithButton,
            divider: Slack._divider,
            header: Slack._header,
            buttons: Slack._buttons,
            markdown: Slack._markdown,
            sectionWithAccessory: Slack._sectionWithAccessory,
            context: Slack._context,
            overflow: Slack._overflow,
            overflowOption: Slack._overflowOption
        };
    }

    /**
     * A Slack Block type presenting a plain text message to the user.
     *
     * @param {String} message The message that will be displayed to the user.
     * @returns An object in the form required by Slack to represent a pain text message.
     */
    private static _plainText(message: string) {
        return {
            type: "section",
            text: {
                type: "plain_text",
                text: message,
            },
        };
    }

    /**
     * A Slack Block type that has text to the left of a button. The button can be linked with an
     * action ID, which dictates what will happen when the button is clicked, beyond redirecting the
     * user to a URL.
     *
     * @param sectionText The message that will be displayed to the user alongside the button.
     * @param buttonText The text that will be displayed inside the button.
     * @param value A value to pass along with the response body. Useful for identifying
     * which button has been pressed.
     * @param url The URL that the user will immediately be redirected to.
     * @param actionId The name of the function that will be called by the HTTP
     * response (in this case, that is the name of the Google Apps Script function to be called by
     * the doPost() function).
     * @returns An object in the form required by Slack to represent the "Section with Button" block.
     */
    private static _sectionWithButton(sectionText: string, buttonText: string, value: string, url: string, actionId: string): object {
        let accessory: { [key: string]: any } = {
            type: "button",
            text: {
                type: "plain_text",
                text: buttonText,
                emoji: true,
            },
            value: value,
            action_id: actionId,
        };

        if (url) accessory.url = url; // Only add the url if it's not blank

        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: sectionText,
            },
            accessory: accessory,
        };
    }

    /**
     * A Slack block representing a divider line.
     *
     * @returns A Slack block representing a divider line.
     */
    private static _divider(): object {
        return {
            type: "divider",
        };
    }

    /**
     * A Slack block type representing a text header.
     *
     * @param headerText
     * @returns A Slack block representing a header object.
     */
    private static _header(headerText: string): object {
        return {
            type: "header",
            text: {
                type: "plain_text",
                text: headerText,
                emoji: true,
            },
        };
    }

    private static _buttons(elements: Button[]): object {
        let accessory: { [key: string]: any } = {
            type: "actions",
            elements: [...elements
                .map((element) => {
                    let button: { [key: string]: any } = {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: element.buttonText,
                            emoji: true,
                        },
                        value: element.value,
                        action_id: element.actionId
                    }

                    if (element.url) button["url"] = element.url;
                    if (element.style) button["style"] = element.style;

                    return button
                })
            ]
        };

        return accessory;
    }



    /**
     * A Slack Block type presenting a markdown message to the user.
     *
     * @param {String} message The message that will be displayed to the user.
     * @returns An object in the form required by Slack to represent a message with markdown formatting.
     */
    private static _markdown(message: string) {
        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: message,
            },
        };
    }

    private static _sectionWithAccessory(sectionText: string, accessory: object): object {
        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: sectionText,
            },
            accessory: accessory
        }
    }

    private static _context(contextText: string): object {
        return {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: contextText,
                }
            ]
        }
    }

    private static _overflow(options: { [key: string]: object | string }[], actionId: string): object {
        return {
            type: "overflow",
            options: options,
            action_id: actionId
        }
    }

    private static _overflowOption(text: string, value: string, url?: string): { [key: string]: object | string } {
        let option: { [key: string]: any } = {
            text: {
                type: "plain_text",
                text: text,
                emoji: true
            },
            value: value,
        }

        if (url) option["url"] = url;

        return option
    }
}

interface Button {
    buttonText: string;
    value: string;
    url: string;
    actionId: string;
    style?: string;
}

function connectSlack() {
    return new Slack();
}