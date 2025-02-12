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
     * @param callbackFunction the function that is called when the interactivity is handled.
     * @returns the result of the callback function.
     * 
     */
    handleInteractivity(event: GoogleAppsScript.Events.DoPost, callbackId: string) {
        let payload = JSON.parse(event.parameter.payload);

        console.log("Received payload: ", payload);

        let callbackFunction: { [key: string]: Function } = {
            "count_emoji": CountMoji.receiveMessage
        };

        console.log("Callback ID: ", callbackId);

        return callbackFunction[callbackId](payload);
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
}