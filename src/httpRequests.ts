/**
 * These are special Apps Script functions. Do not change
 * the function names.
 *
 * REMINDER: If you update these functions, or anything these
 * functions point to, you have to deploy a new version of the
 * Apps Script web app, otherwise Slack will continue pointing
 * to the last version where the web app was updated.
 *
 * You then need to update the Request URL in the Interactivity
 * section of the Slack API settings for your bot. This ensures that
 * it's using the correct version of the web app.
 */
/**
 *
 * @param {String} e A JSON-type string,
 * @returns
 */
function doPost(e: GoogleAppsScript.Events.DoPost) {
    var slack = new Slack();
    let callbackId = JSON.parse(e.parameter.payload).callback_id;
    slack.handleInteractivity(e, callbackId);

    // Return an HTTP 200 OK response
    return ContentService.createTextOutput()
        .setMimeType(ContentService.MimeType.JSON)
        .setContent(JSON.stringify({ status: "OK" }));
}
/**
 * At this stage there is no intention of using this function to present
 * anything in response to a get request, but if that changes, this
 * is where that response information would go.
 *
 * @returns 200 code to say it's successfully received the request.
 */
function doGet() {
    // Return an HTTP 200 OK response
    return ContentService.createTextOutput()
        .setMimeType(ContentService.MimeType.JSON)
        .setContent(JSON.stringify({ status: "OK" }));
}
