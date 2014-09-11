/*
 * test
    Document   : de_dieploegers_followup.js
    Author     : Dennis Plöger <develop@dieploegers.de>
    Description:
        Defer an email until a certain point in time, move it into a
        folder. Later move it back to inbox.
*/

/**
 * Available defer types
 */

de_dieploegers_followupHandlerObject.deferTypes = {

    "DEFER_1HOUR": {
        textKey: "MENU_DEFER_1HOUR",
        imageKey: "MENU_DEFER_1HOUR_IMAGE",
        toolTipKey : "MENU_DEFER_1HOUR_TOOLTIP",
        counter: 3600
    },

    "DEFER_1DAY": {
        textKey: "MENU_DEFER_1DAY",
        imageKey: "MENU_DEFER_1DAY_IMAGE",
        toolTipKey : "MENU_DEFER_1DAY_TOOLTIP",
        counter: 86400
    },

    "DEFER_1WEEK": {
        textKey: "MENU_DEFER_1WEEK",
        imageKey: "MENU_DEFER_1WEEK_IMAGE",
        toolTipKey : "MENU_DEFER_1WEEK_TOOLTIP",
        counter: 604800
    },

    "DEFER_UNTIL": {
        textKey: "MENU_DEFER_UNTIL",
        detailKey: "MENU_DEFER_UNTILDETAIL",
        imageKey: "MENU_DEFER_UNTIL_IMAGE",
        toolTipKey : "MENU_DEFER_UNTIL_TOOLTIP",
        counter: 0
    }

};

//Create zimlet handler object

function de_dieploegers_followupHandlerObject() {
}

de_dieploegers_followupHandlerObject.prototype = new ZmZimletBase();
de_dieploegers_followupHandlerObject.prototype.constructor =
    de_dieploegers_followupHandlerObject;

/**
 * Create metadata for deferred mail
 *
 * @param message      The ZmMailMsg object of the deferred mail
 * @param deferPIT     The point of time for deferring the mail
 * @param originalDate The original date of the mail
 */

de_dieploegers_followupHandlerObject.prototype.createMetaData =
function(message, deferPIT, originalDate) {

    var deferMetadata,
        metadata;

    deferMetadata = {};

    // Set original date

    deferMetadata.originalDate = originalDate.getTime();

    // Initialize the log

    deferMetadata.log = JSON.stringify([{
        at: new Date().getTime(),
        until: deferPIT
    }]);

    metadata = new ZmMetaData(appCtxt.getActiveAccount(), message.id);

    metadata.set("de_dieploegers_followup", deferMetadata);

};

/**
 * Initialize the zimlet
 */

de_dieploegers_followupHandlerObject.prototype.init = function () {

    var tmpKey;

    // Load up user properties

    this.deferFolderId = this.getUserProperty("deferFolderId");
    this.deferFolderName = this.getUserProperty("deferFolderName");
    this.deferTagId = this.getUserProperty("deferTagId");
    this.deferTagName = this.getUserProperty("deferTagName");
    this.lastUsedDefer = this.getUserProperty("lastUsedDefer");
    this.lastUsedPIT = this.getUserProperty("lastUsedPIT");
    this.showInfoPane = this.getUserProperty("showInfoPane");
    this.useSmallIcon = this.getUserProperty("useSmallIcon");

    // Initialize probably empty properties

    if (this.showInfoPane == null) {

        this.showInfoPane = true;

    } else {

        this.showInfoPane = (this.showInfoPane === 'true');

    }

    if (this.useSmallIcon == null) {

        this.useSmallIcon = false;

    } else {

        this.useSmallIcon = (this.useSmallIcon === 'true');

    }

    if ((!this.lastUsedDefer) ||
        (!de_dieploegers_followupHandlerObject.deferTypes.hasOwnProperty(
                this.lastUsedDefer
            )
        )
    ) {

        for (tmpKey in de_dieploegers_followupHandlerObject.deferTypes) {

            if (de_dieploegers_followupHandlerObject.deferTypes.hasOwnProperty(
                    tmpKey
                )
            ) {

                if (de_dieploegers_followupHandlerObject.deferTypes[
                        tmpKey
                    ].counter > 0
                ) {

                    this.lastUsedDefer = tmpKey;
                    break;

                }

            }

        }

        this.setUserProperty("lastUsedDefer", this.lastUsedDefer, true);

    }

    if (!this.lastUsedPIT) {

        this.lastUsedPIT = 0;

        this.setUserProperty("lastUsedPIT", this.lastUsedPIT, true);

    }

};

/**
 * Start deferring messages (After clicking on the defer-menu or after
 * selecting a point in time)
 *
 * @param ev DwtEvent of the click
 */

de_dieploegers_followupHandlerObject.prototype.deferMessages =
function (ev) {

    var deferCounter,
        i,
        parsedDate,
        pITDate,
        selectedMessages, pITTime, dateFormat;

    // Handle calendar Chooser dialog callback

    if ((this.calendarChooserDialog) &&
        (this.calendarChooserDialog.isPoppedUp())
    ) {

        this.calendarChooserDialog.popdown();

        // Set Point In Time and rewrite menu

        pITDate = this.calendarChooserCalendar.getDate();
        pITTime = this.calendarChooserTime.getValue();

        pITDate.setHours(pITTime.getHours());
        pITDate.setMinutes(pITTime.getMinutes());
        pITDate.setSeconds(pITTime.getSeconds());

        this.lastUsedPIT = pITDate.getTime();

        dateFormat = new AjxDateFormat(
            I18nMsg.formatDateShort
        );

        parsedDate = dateFormat.format(pITDate);

        if (!this.useSmallIcon) {

            this.toolbarButton.setText(
                AjxMessageFormat.format(
                    this.getMessage(
                        de_dieploegers_followupHandlerObject.deferTypes[
                            this.lastUsedDefer
                        ].detailKey
                    ),
                    [
                        parsedDate
                    ]
                )
            );

        }

        // Update toolbar items with last used PIT

        this.toolbarMenuItems[this.lastUsedDefer].setText(
            AjxMessageFormat.format(
                this.getMessage(
                    de_dieploegers_followupHandlerObject.deferTypes[
                        this.lastUsedDefer
                    ].detailKey
                ),
                [
                    parsedDate
                ]
            )
        );

        this.toolbarButton.setData(
            "de_dieploegers_followupDeferKey",
            this.lastUsedDefer
        );

        this.setUserProperty("lastUsedPIT", this.lastUsedPIT, true);

        deferCounter = 0;

    } else {

        // Set toolbar button

        if (!this.useSmallIcon) {

            this.toolbarButton.setText(
                this.getMessage(
                    de_dieploegers_followupHandlerObject.deferTypes[
                        this.lastUsedDefer
                    ].textKey
                )
            );

        }

        this.toolbarButton.setData(
            "de_dieploegers_followupDeferKey",
            this.lastUsedDefer
        );

        deferCounter = ev;

    }

    // Defer selected messages

    selectedMessages =
        appCtxt.getCurrentApp().getMailListController().getSelection();

    this.messageCount = selectedMessages.length;
    this.messageReturned = 0;

    for (i = 0; i < selectedMessages.length; i = i + 1) {

        if (selectedMessages[i].type == ZmId.ITEM_CONV) {

            // Set defer on first hot message

            this.setDefer(
                selectedMessages[i].getFirstHotMsg(),
                deferCounter,
                this.lastUsedPIT
            );

        } else {

            this.setDefer(selectedMessages[i], deferCounter, this.lastUsedPIT);

        }

    }

};

/**
 * Callback after changing the date of a message to defer
 *
 * @param message      The ZmMailMsg Object of the message to defer
 * @param deferPIT     Point in time to defer the message
 * @param originalDate Original date of the mail
 * @param ev           DwtEvent from the listener/callback
 */

de_dieploegers_followupHandlerObject.prototype.deferMove =
function (message, deferPIT, originalDate, ev) {

    var controller,
        deferred,
        detailString,
        messageBody,
        messageBox, metaData;

    if (ev.isException()) {

        // Changing the date via JSP failed. Show error message

        messageBox = appCtxt.getErrorDialog();

        messageBox.setMessage(
            this.getMessage("ERROR_DEFERFAILURE"),
            DwtMessageDialog.CRITICAL_STYLE,
            this.getMessage("ERROR_DEFERFAILURE_TITLE")
        );

        messageBody = message.getBodyContent();

        if (messageBody.length > 200) {

            messageBody = message.getBodyContent().substr(0, 200) + "...";

        }

        detailString = AjxMessageFormat.format(
            this.getMessage("ERROR_DEFERFAILURE_DETAIL"),
            [
                message.getAddress(AjxEmailAddress.FROM),
                message.getAddresses(AjxEmailAddress.TO).join(", "),
                message.getAddresses(AjxEmailAddress.CC).join(", "),
                message.getAddresses(AjxEmailAddress.BCC).join(", "),
                message.getHeaderStr(ZmMailMsg.HDR_DATE),
                message.subject,
                messageBody
            ]
        );

        messageBox.setDetailString(detailString);

        messageBox.popup();

        return false;

    }

    deferred = appCtxt.getById(this.deferFolderId);

    // HACK: needed to ensure current list updates to next message
    controller = appCtxt.getCurrentController();
    controller._listView[controller._currentView]._itemToSelect =
        controller._getNextItemToSelect();

    // Untag items, if they have the "Returned from defer"-tag set.

    if (message.hasTag(this.deferTagName)) {

        message.list.tagItems({
            items: message,
            tagName: this.deferTagName,
            doTag: false
        });

    }

    // Set metadata

    metaData = new ZmMetaData(appCtxt.getActiveAccount(), message.id);

    metaData.get(
        "de_dieploegers_followup",
        null,
        new AjxCallback(
            this,
            this.updateMetaData,
            Array(message, deferPIT, originalDate)
        )
    );

    // Move items

    message.list.moveItems({
        items: message,
        folder: deferred,
        callback: new AjxCallback(
            this,
            this.handleDeferCallback,
            Array(message)
        )
    });

};

/**
 * @see de_dieploegers_followupHandlerObject.prototype.singleClicked
 */

de_dieploegers_followupHandlerObject.prototype.doubleClicked =
function (canvas) {

    this.singleClicked(canvas);

};

/**
 * Callback after the message has been moved into the subfolder
 *
 * @param message The ZmMailMsg of the deferred mail
 * @param ev      DwtEvent from the callback
 */

de_dieploegers_followupHandlerObject.prototype.handleDeferCallback =
function (message, ev) {

    var detailString,
        messageBody,
        messageBox, statusMessage;

    this.messageReturned = this.messageReturned + 1;

    if (ev.isException()) {

        // Moving the mail failed. Show error message

        messageBox = appCtxt.getErrorDialog();

        messageBox.setMessage(
            this.getMessage("ERROR_DEFERFAILURE"),
            DwtMessageDialog.CRITICAL_STYLE,
            this.getMessage("ERROR_DEFERFAILURE_TITLE")
        );

        messageBody = message.getBodyContent();

        if (messageBody.length > 200) {

            messageBody = message.getBodyContent().substr(0, 200) + "...";

        }

        detailString = AjxMessageFormat.format(
            this.getMessage("ERROR_DEFERFAILURE_DETAIL"),
            [
                message.getAddress(AjxEmailAddress.FROM),
                message.getAddresses(AjxEmailAddress.TO).join(", "),
                message.getAddresses(AjxEmailAddress.CC).join(", "),
                message.getAddresses(AjxEmailAddress.BCC).join(", "),
                message.getHeaderStr(ZmMailMsg.HDR_DATE),
                message.subject,
                messageBody
            ]
        );

        messageBox.setDetailString(detailString);

        messageBox.popup();

        return false;

    }

    // Are we there yet?

    if (this.messageReturned < this.messageCount) {

        statusMessage = AjxMessageFormat.format(
            this.getMessage("LABEL_DEFERRINGMESSAGES"),
            [
                this.messageReturned,
                this.messageCount
            ]
        );

        appCtxt.setStatusMsg({
            msg: statusMessage,
            level: ZmStatusView.LEVEL_INFO
        });

    } else {

        appCtxt.setStatusMsg({
            msg: this.getMessage("LABEL_DEFERDONE"),
            level: ZmStatusView.LEVEL_INFO
        });

    }

};

/**
 * Handle the click on the defer-actions in the menubar
 *
 * @param ev DwtEvent of the click
 */

de_dieploegers_followupHandlerObject.prototype.handleMenuClick =
function (ev) {

    var chooserComposite,
        chooserLabel,
        deferKey,
        deferCounter,
        firstDayOfWeek,
        messageBox,
        serverId,
        useISO8601WeekNo, timeSheet;

    // If no messages selected (just to be sure), exit at once

    if (appCtxt.getCurrentApp().getMailListController(
            ).getSelectionCount() === 0
    ) {

        return false;

    }

    deferKey = ev.item.getData("de_dieploegers_followupDeferKey");
    deferCounter = de_dieploegers_followupHandlerObject.deferTypes[
                       deferKey
                   ].counter;

    this.lastUsedDefer = deferKey;

    this.setUserProperty("lastUsedDefer", this.lastUsedDefer, true);

    /**
     * Check, if destination folder exists or otherwise show messagebox
     * and lead user to preferences pane.
     */

    if (!appCtxt.getFolderTree().getById(this.deferFolderId)) {

        messageBox = appCtxt.getMsgDialog();

        messageBox.setMessage(
            this.getMessage("ERROR_NOFOLDER"),
            DwtMessageDialog.CRITICAL_STYLE,
            this.getMessage("ERROR_NOFOLDER_TITLE")
        );

        messageBox.popup();

        messageBox.registerCallback(
            DwtDialog.OK_BUTTON,
            this.singleClicked,
            this,
            messageBox
        );

        return false;

    }

    /**
     * Check, if the tag exists or otherwise show messagebox and
     * lead user to preferences pane.
     */

    if (!appCtxt.getTagTree().getByName(this.deferTagName)) {

        messageBox = appCtxt.getMsgDialog();

        messageBox.setMessage(
            this.getMessage("ERROR_NOTAG"),
            DwtMessageDialog.CRITICAL_STYLE,
            this.getMessage("ERROR_NOTAG_TITLE")
        );

        messageBox.popup();

        messageBox.registerCallback(
            DwtDialog.OK_BUTTON,
            this.singleClicked,
            this,
            messageBox
        );

        return false;
    }

    // Handle "Defer until..." clicks to select a date

    if (deferCounter === 0) {

        if (!this.calendarChooserDialog) {

            // Build up chooser dialog

            this.calendarChooserDialog = new DwtDialog({
                parent: this.getShell(),
                title: this.getMessage("DIALOG_CALENDARCHOOSER_TITLE")
            });

            chooserComposite = new DwtComposite({
                parent: this.getShell()
            });

            chooserLabel = new DwtLabel({

                parent: chooserComposite

            });

            chooserLabel.setText(this.getMessage("LABEL_SELECTDATE"));

            firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

            serverId = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
            useISO8601WeekNo = (
                serverId &&
                serverId.indexOf("Europe") === 0 &&
                serverId != "Europe/London"
            );

            // Date chooser

            this.calendarChooserCalendar = new DwtCalendar({

                parent: chooserComposite,
                firstDayOfWeek: firstDayOfWeek,
                useISO8601WeekNo : useISO8601WeekNo,
                showWeekNumber: true

            });

            if (Number(this.lastUsedPIT) > 0) {

                this.calendarChooserCalendar.setDate(
                    new Date(Number(this.lastUsedPIT))
                );

            }

            // Time chooser

            timeSheet = new DwtPropertySheet(chooserComposite);

            this.calendarChooserTime = new DwtTimeInput(
                chooserComposite,
                DwtTimeInput.START
            );

            this.calendarChooserTime.set(new Date());

            timeSheet.addProperty(
                this.getMessage("LABEL_TIME"),
                this.calendarChooserTime,
                true
            );

            this.calendarChooserDialog.setView(chooserComposite);

            this.calendarChooserDialog.setButtonListener(
                DwtDialog.CANCEL_BUTTON,
                new AjxListener(
                    this,
                    function (ev) {

                        this.calendarChooserDialog.popdown();

                    }
                )
            );

            this.calendarChooserDialog.setButtonListener(

                DwtDialog.OK_BUTTON,
                new AjxListener(
                    this,
                    this.deferMessages
                )

            );

        }

        // First select the date, then defer the messages

        this.calendarChooserDialog.popup();

        return true;

    }

    // Defer the messages

    this.deferMessages(deferCounter);

};

/**
 * Callback from onMsgView after loading the metadata of a mail
 *
 * @param msg     The ZmMailMsg of the mail
 * @param msgView The Mail message view
 * @param result  The result of loading the metadata
 */

de_dieploegers_followupHandlerObject.prototype.handleMetaDataLoad =
function (msg, msgView, result) {

    var deferMetaData,
        el,
        infoPane,
        infoPaneText,
        response, infoPaneToolbar, closePane, showLog, removeTag, infoPaneLabel, origDate;

    // Did we get any metadata?

    if (result instanceof ZmCsfeResult) {

        response =
            result.getResponse().BatchResponse.GetCustomMetadataResponse[0];

        if (response.meta && response.meta[0]) {

            deferMetaData = response.meta[0]._attrs;

        } else {

            // Message hasn't been deferred

            return;

        }

    } else {

        return;

    }

    el = msgView.getHtmlElement();

    // Create message info pane

    infoPane = new DwtComposite({
        parent: msgView
    });

    // Info Toolbar

    infoPaneToolbar = new ZmButtonToolBar({
        parent: infoPane,
        posStyle: DwtControl.STATIC_STYLE,
        buttons: ["close", "log", "removeTag"]
    });

    infoPane.addChild(infoPaneToolbar);

    // Create "Close"-Button

    closePane = infoPaneToolbar.getOp("close");

    closePane.setText(this.getMessage("INFOPANE_CLOSE"));
    closePane.setImage("Cancel");

    closePane.addSelectionListener(
        new AjxListener(
            this,
            function (infoPane, ev) {

                infoPane.setVisible(false);

            },
            infoPane
        )
    );

    // Create "Show Log"-Button

    showLog = infoPaneToolbar.getOp("log");

    showLog.setText(this.getMessage("INFOPANE_SHOWLOG"));
    showLog.setImage("Doc");

    showLog.addSelectionListener(
        new AjxListener(
            this,
            this.handleShowLog,
            deferMetaData.log
        )
    );

    removeTag = infoPaneToolbar.getOp("removeTag");

    // Create remove tag button

    removeTag.setText(
        AjxMessageFormat.format(
            this.getMessage("INFOPANE_REMOVETAG"),
            [
                this.deferTagName
            ]
        )
    );

    removeTag.setImage("DeleteTag");

    removeTag.addSelectionListener(
        new AjxListener(
            this,
            this.handleRemoveTag,
            [msg, removeTag]
        )
    );

    if (!msg.hasTag(this.deferTagName)) {

        removeTag.setEnabled(false);

    }

    // Info Text

    infoPaneLabel = new DwtLabel({
        parent: infoPane,
        style: DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT
    });

    infoPaneLabel.addClassName("InfoBox");

    infoPaneLabel.setSize(Dwt.DEFAULT,"4em");

    infoPane.addChild(infoPaneLabel);

    infoPaneLabel.setImage("Time");

    infoPaneText = this.getMessage("INFOPANE_INTRO");

    origDate = AjxMessageFormat.format(
        I18nMsg.formatDateTime,
        [
            AjxDateFormat.format(
                I18nMsg.formatDateShort,
                new Date(Number(deferMetaData.originalDate))
            ),
            AjxDateFormat.format(
                I18nMsg.formatTimeMedium,
                new Date(Number(deferMetaData.originalDate))
            )
        ]
    );

    infoPaneText = infoPaneText + " " + AjxMessageFormat.format(
        this.getMessage("INFOPANE_ORIGDATE"),
        [
            origDate
        ]
    );

    infoPaneLabel.setText(infoPaneText);

    infoPane.addChild(infoPaneLabel);

    el.insertBefore(infoPane.getHtmlElement(), el.firstChild);

};

/**
 * Handle the click on "Remove Tag"
 *
 * @param message   The ZmMailMsg of the active mail
 * @param removeTag The Button-object (used to disable it)
 * @param ev        DwtEvent of the click event
 */

de_dieploegers_followupHandlerObject.prototype.handleRemoveTag =
function (message, removeTag, ev) {

    if (message.hasTag(this.deferTagName)) {

        message.list.tagItems({
            items: message,
            tagName: this.deferTagName,
            doTag: false
        });

        removeTag.setEnabled(false);

    }

};

/**
 * Handle the click on "Select folder" (Property-Panel)
 *
 * @param ev DwtEvent of the click event
 */

de_dieploegers_followupHandlerObject.prototype.handleSelectFolder =
function (ev) {

    var treeIdsParam,
        omitParam;

    // Simply reuse the ChooseFolderDialog

    this.chooseDeferFolder = appCtxt.getChooseFolderDialog();

    // Show only folders

    treeIdsParam = {};
    treeIdsParam.deferFolder = [ ZmOrganizer.FOLDER ];

    omitParam = {};

    // Omit trash, spam, sent and drafts. We don't want to mess with those

    omitParam[ZmFolder.ID_TRASH] = true;
    omitParam[ZmFolder.ID_SPAM] = true;
    omitParam[ZmFolder.ID_SENT] = true;
    omitParam[ZmFolder.ID_DRAFTS] = true;

    this.chooseDeferFolder.popup({

        treeIds: treeIdsParam,
        overviewId: this.chooseDeferFolder.getOverviewId(ZmApp.MAIL),
        title: this.getMessage("DIALOG_SELECTDEFERFOLDER_TITLE"),
        description: this.getMessage("DIALOG_SELECTDEFERFOLDER_DESCRIPTION"),
        skipRemote: true,
        skipReadOnly: true,
        noRootSelect: true,
        omit: omitParam

    });

    this.chooseDeferFolder.registerCallback(
        DwtDialog.OK_BUTTON,
        this.handleSelectFolderOk,
        this
    );

};

/**
 * Handle the selection of a folder
 *
 * @param folder Selected folder
 */

de_dieploegers_followupHandlerObject.prototype.handleSelectFolderOk =
function (folder) {

    var messageBox;

    // Croak, it the user selected the inbox (Well, duuuh!)

    if (folder.id === String(ZmFolder.ID_INBOX)) {

        messageBox = appCtxt.getMsgDialog();

        messageBox.setMessage(
            this.getMessage("ERROR_NOTINBOX"),
            DwtMessageDialog.CRITICAL_STYLE,
            this.getMessage("ERROR_NOTINBOX_TITLE")
        );

        messageBox.popup();

        return false;

    }

    // Save folder to property pane

    this.deferFolderInput.setValue(folder.name);
    this.deferFolderInput.setData("deferFolderId", Number(folder.id));

    this.chooseDeferFolder.popdown();

};

/**
 * Handle click on "Select tag" (Property pane)
 *
 * @param ev DwtEvent of the click
 */

de_dieploegers_followupHandlerObject.prototype.handleSelectTag =
function (ev) {

    // Simply reuse the PickTagDialog

    this.chooseDeferTag = appCtxt.getPickTagDialog();

    this.chooseDeferTag.popup();

    this.chooseDeferTag.registerCallback(
        DwtDialog.OK_BUTTON,
        this.handleSelectTagOk,
        this
    );

};

/**
 * Handle the selection of a tag
 *
 * @param tag The selected tag
 */

de_dieploegers_followupHandlerObject.prototype.handleSelectTagOk =
function (tag) {

    // Save tag to property pane

    this.deferTagInput.setValue(tag.name);
    this.deferTagInput.setData("deferTagId", Number(tag.id));

    this.chooseDeferTag.popdown();

};

/**
 * Handle the click on "Show log"
 *
 * @param jsonlog The log, json-encoded
 * @param ev      DwtEvent of the click
 */

de_dieploegers_followupHandlerObject.prototype.handleShowLog =
function (jsonlog, ev) {

    var atDate,
        i,
        log,
        logText,
        messageBox,
        untilDate;

    logText = this.getMessage("LOG_INTRO");

    /**
     * Okay, that's cruel: Try to unmarshal the log. If that fails, the mail
     * probably hasn't got a log, so just display the "empty" text.
     *
     * This should actually never happen
     */

    try {

        log = JSON.parse(jsonlog);

        for (i = 0; i < log.length; i = i + 1) {

            atDate = AjxMessageFormat.format(
                I18nMsg.formatDateTime,
                [
                    AjxDateFormat.format(
                        I18nMsg.formatDateShort,
                        new Date(Number(log[i].at))
                    ),
                    AjxDateFormat.format(
                        I18nMsg.formatTimeMedium,
                        new Date(Number(log[i].at))
                    )
                ]
            );

            untilDate = AjxMessageFormat.format(
                I18nMsg.formatDateTime,
                [
                    AjxDateFormat.format(
                        I18nMsg.formatDateShort,
                        new Date(Number(log[i].until))
                    ),
                    AjxDateFormat.format(
                        I18nMsg.formatTimeMedium,
                        new Date(Number(log[i].until))
                    )
                ]
            );

            logText = logText + AjxMessageFormat.format(
                this.getMessage("LOG_LINE"),
                [
                    atDate,
                    untilDate
                ]
            );

        }

    } catch (e) {

        logText = logText + this.getMessage("LOG_EMPTY");

    }

    // Show formatted text in a simple message dialog

    messageBox = appCtxt.getMsgDialog();

    messageBox.setMessage(logText);

    messageBox.popup();

};

/**
 * Hook to add our "defer"-button to the main button toolbar
 *
 * @see ZmZimletBase.initializeToolbar
 */

de_dieploegers_followupHandlerObject.prototype.initializeToolbar =
function (
    app,
    toolbar,
    controller,
    viewId
) {

    var buttonParams,
        currentKey,
        dateFormat,
        menuListener,
        originalFunction,
        parsedDate;

    viewId = appCtxt.getViewTypeFromId(viewId);

    if (viewId == ZmId.VIEW_CONVLIST ||
        viewId == ZmId.VIEW_TRAD
    ) {

        // Listener for the buttons

        menuListener = new AjxListener(
            this,
            this.handleMenuClick
        );

        // Set defer button

        currentKey = this.lastUsedDefer;

        buttonParams = {
            tooltip: this.getMessage(
                de_dieploegers_followupHandlerObject.deferTypes[
                    currentKey
                ].toolTipKey
            ),
            image: this.getMessage(
                de_dieploegers_followupHandlerObject.deferTypes[
                    currentKey
                ].imageKey
            ),
            showImageInToolbar: true,
            showTextInToolbar: false,
            text: this.getMessage(
                de_dieploegers_followupHandlerObject.deferTypes[
                    currentKey
                    ].textKey
            )
        };

        if (!this.useSmallIcon) {
            buttonParams["showTextInToolbar"] = true;
        }

        this.toolbarButton = toolbar.createZimletOp(
            "DE_DIEPLOEGERS_FOLLOWUP_DEFER",
            buttonParams
        );

        this.toolbarButton.setData(
            "de_dieploegers_followupDeferKey",
            currentKey
        );

        // Set the menu button to the last used defer action

        if (Number(this.lastUsedPIT) > 0) {

            dateFormat = new AjxDateFormat(
                I18nMsg.formatDateShort
            );

            parsedDate = dateFormat.format(
                new Date(
                    Number(this.lastUsedPIT)
                )
            );

        }

        if ((de_dieploegers_followupHandlerObject.deferTypes[
                currentKey
            ].counter === 0) &&
            (
                !this.useSmallIcon
            )
        ) {

            this.toolbarButton.setText(
                AjxMessageFormat.format(
                    this.getMessage(
                        de_dieploegers_followupHandlerObject.deferTypes[
                            currentKey
                        ].detailKey
                    ),
                    [
                        parsedDate
                    ]
                )
            );

        }

        this.toolbarButton.setData(
            "de_dieploegers_followupDeferKey",
            currentKey
        );

        this.toolbarButton.addSelectionListener(menuListener);

        this.toolbarMenu = new DwtMenu({
            parent: this.toolbarButton
        });

        // Create menu

        this.toolbarMenuItems = {};

        for (currentKey in de_dieploegers_followupHandlerObject.deferTypes) {

            if (de_dieploegers_followupHandlerObject.deferTypes.hasOwnProperty(
                currentKey
            )) {

                this.toolbarMenuItems[currentKey] = new DwtMenuItem({
                    parent: this.toolbarMenu
                });

                this.toolbarMenuItems[currentKey].setText(
                    this.getMessage(
                        de_dieploegers_followupHandlerObject.deferTypes[
                            currentKey
                        ].textKey
                    )
                );

                // Add last used defer date to the "defer until"-action

                if ((de_dieploegers_followupHandlerObject.deferTypes[
                        currentKey
                    ].counter === 0) &&
                    (Number(this.lastUsedPIT) > 0)
                ) {

                    this.toolbarMenuItems[currentKey].setText(
                        AjxMessageFormat.format(
                            this.getMessage(
                                de_dieploegers_followupHandlerObject.deferTypes[
                                    currentKey
                                ].detailKey
                            ),
                            [
                                parsedDate
                            ]
                        )
                    );

                }

                this.toolbarMenuItems[currentKey].setImage(
                    this.getMessage(
                        de_dieploegers_followupHandlerObject.deferTypes[
                            currentKey
                        ].imageKey
                    )
                );

                this.toolbarMenuItems[currentKey].setToolTipContent(
                    this.getMessage(
                        de_dieploegers_followupHandlerObject.deferTypes[
                            currentKey
                        ].toolTipKey
                    )
                );

                this.toolbarMenuItems[currentKey].setData(
                    "de_dieploegers_followupDeferKey",
                    currentKey
                );

                this.toolbarMenuItems[currentKey].addSelectionListener(
                    menuListener
                );

            }

        }

        this.toolbarButton.setMenu(this.toolbarMenu);

        // Disable button, because no mails are selected at bootup

        this.toolbarButton.setEnabled(false);

        originalFunction = controller._resetOperations;

        /**
         * HACK, because Zimbra doesn't know better: If mails are selected,
         * enable the button
         */

        controller._resetOperations = function (parent, num) {

            var currentApp;

            originalFunction.apply(controller, arguments);

            currentApp = appCtxt.getCurrentApp();

            if (
                (currentApp.getMailListController) &&
                (currentApp.getMailListController().getSelectionCount() > 0)
            ) {

                parent.enable("DE_DIEPLOEGERS_FOLLOWUP_DEFER", true);

            }

        };

    }

};

/**
 * Hook on the display of a message
 *
 * @see ZmZimletBase.onMsgView
 */

de_dieploegers_followupHandlerObject.prototype.onMsgView =
function(msg, oldMsg, msgView) {

    /**
     * If the user has enabled the info pane in property pane,
     * the mail is not shared, its no invite and no share message,
     * load the mails metadata and show the info pane.
     */

    var metaData;

    if (this.showInfoPane && !msg.isShared() && !msg.isInvite() && !msg.share
        ) {

        metaData = new ZmMetaData(appCtxt.getActiveAccount(), msg.id);

        metaData.get(
            "de_dieploegers_followup",
            null,
            new AjxCallback(
                this,
                this.handleMetaDataLoad,
                [msg, msgView]
            )
        );

    }
};

/**
 * Handle click on "Ok" of property pane.
 *
 * @param ev DwtEvent of Click
 */

de_dieploegers_followupHandlerObject.prototype.propertyEditorOk =
function (ev) {

    var messageBox;

    if ((this.deferFolderInput.getData("deferFolderId") == -1) ||
        (this.deferTagInput.getData("deferTagId") == -1)
    ) {

        messageBox = appCtxt.getMsgDialog();

        messageBox.setMessage(
            this.getMessage("ERROR_MANDATORY"),
            DwtMessageDialog.CRITICAL_STYLE,
            this.getMessage("ERROR_MANDATORY_TITLE")
        );

        messageBox.popup();

        return false;

    }

    // Store selected folder

    if (this.deferFolderInput.getData("deferFolderId") !== -1) {

        // Check, if folder exists

        if (!appCtxt.getFolderTree().getById(
                this.deferFolderInput.getData("deferFolderId")
            )
        ) {

            messageBox = appCtxt.getMsgDialog();

            messageBox.setMessage(
                this.getMessage("ERROR_NOFOLDER"),
                DwtMessageDialog.CRITICAL_STYLE,
                this.getMessage("ERROR_NOFOLDER_TITLE")
            );

            messageBox.popup();

            return false;

        }

        this.setUserProperty(
            "deferFolderId",
            this.deferFolderInput.getData("deferFolderId"),
            true
        );

        this.setUserProperty(
            "deferFolderName",
            this.deferFolderInput.getValue(),
            true
        );

        this.deferFolderId = this.deferFolderInput.getData("deferFolderId");
        this.deferFolderName = this.deferFolderInput.getValue();

    }

    // Store selected tag

    if (this.deferTagInput.getData("deferTagId") !== -1) {

        // Check, if tag exists

        if (!appCtxt.getTagTree().getById(
                this.deferTagInput.getData("deferTagId")
            )
        ) {

            messageBox = appCtxt.getMsgDialog();

            messageBox.setMessage(
                this.getMessage("ERROR_NOTAG"),
                DwtMessageDialog.CRITICAL_STYLE,
                this.getMessage("ERROR_NOTAG_TITLE")
            );

            messageBox.popup();

            return false;
        }

        this.setUserProperty(
            "deferTagId",
            this.deferTagInput.getData("deferTagId"),
            true
        );

        this.setUserProperty(
           "deferTagName",
           this.deferTagInput.getValue(),
           true
        );

        this.deferTagId = this.deferTagInput.getData("deferTagId");
        this.deferTagName = this.deferTagInput.getValue();

    }

    // Store "Show infopane?"-Selection

    if (this.showInfoPaneCheck.isSelected()) {

        this.showInfoPane = true;

        this.setUserProperty(
            "showInfoPane",
            this.showInfoPane,
            true
        );

    } else {

        this.showInfoPane = false;

        this.setUserProperty(
            "showInfoPane",
            this.showInfoPane,
            true
        );


    }

    // Store "Show infopane?"-Selection

    if (this.useSmallIconCheck.isSelected()) {

        this.useSmallIcon = true;

        this.setUserProperty(
            "useSmallIcon",
            this.useSmallIcon,
            true
        );

    } else {

        this.useSmallIcon = false;

        this.setUserProperty(
            "useSmallIcon",
            this.useSmallIcon,
            true
        );


    }

    this.propertyEditorDialog.popdown();

};

/**
 * Alter the message's date to reflect the PIT of the defer
 * @param message    ZmMailMsg-Object of the message
 * @param deferCount Count of hours to defer
 * @param deferPIT   Unix Timestamp of Point in time
 */

de_dieploegers_followupHandlerObject.prototype.setDefer =
function (message, deferCount, deferPIT) {

    var today,
        url, originalDate;

    // defer message

    if (deferCount > 0) {

        // Convert "count of hours" into a point in time

        today = new Date();

        deferPIT = new Date(today.getTime() + deferCount * 1000).getTime();

    }

    // Call Server extension to set date

    var soapDoc = AjxSoapDoc.create("ModifyMailDateRequest", "urn:followup");

    m = soapDoc.set("m");
    m.setAttribute("id", message.id)
    m.setAttribute("d", deferPIT);

    originalDate = new Date(message.date);

    appCtxt.getAppController().sendRequest({
        soapDoc: soapDoc,
        asyncMode: true,
        callback: new AjxCallback(
            this,
            this.deferMove,
            [ message, deferPIT, originalDate ]
        )
    });

};

/**
 * Show property pane
 *
 * @param canvas Canvas to show property pane in
 */

de_dieploegers_followupHandlerObject.prototype.singleClicked =
function (canvas) {

    var deferFolderComposite,
        deferFolderDefaultId,
        deferFolderDefaultName,
        deferFolderSelect,
        zimletProperties, deferTagDefaultId, deferTagDefaultName, deferTagComposite, deferTagSelect;

    if (canvas instanceof DwtMessageDialog) {

        canvas.popdown();

    }

    // Popup an already created property editor

    if (this.propertyEditorDialog) {

        this.propertyEditorDialog.popup();

        return true;

    }

    // Create property editor

    this.propertyEditorView = new DwtComposite(this.getShell());

    this.propertyEditorView.setSize('50em', '11em');

    zimletProperties = new DwtPropertySheet(this.propertyEditorView,
        'de_dieploegers_followup_additionalproperties');

    // Defer Folder

    deferFolderDefaultId = this.deferFolderId;
    deferFolderDefaultName = this.deferFolderName;

    if (!deferFolderDefaultId) {

        deferFolderDefaultId = -1;
        deferFolderDefaultName = "";

    }

    deferFolderComposite = new DwtComposite(this.propertyEditorView);

    this.deferFolderInput = new DwtInputField({
        parent: deferFolderComposite,
        id: 'de_dieploegers_followup_deferFolder',
        initialValue: deferFolderDefaultName
    });

    this.deferFolderInput.setEnabled(false);

    this.deferFolderInput.setData("deferFolderId", deferFolderDefaultId);

    deferFolderSelect = new DwtButton({
        parent: deferFolderComposite
    });

    deferFolderSelect.addSelectionListener(
        new AjxListener(
            this,
            this.handleSelectFolder
        )
    );

    deferFolderSelect.setText(this.getMessage("LABEL_SELECTDEFERFOLDER"));

    zimletProperties.addProperty(
        this.getMessage("LABEL_DEFERFOLDER"),
        deferFolderComposite,
        true
    );

    // Defer Tag

    deferTagDefaultId = this.deferTagId;
    deferTagDefaultName = this.deferTagName;

    if (!deferTagDefaultId) {

        deferTagDefaultId = -1;
        deferTagDefaultName = "";

    }

    deferTagComposite = new DwtComposite(this.propertyEditorView);

    this.deferTagInput = new DwtInputField({
        parent: deferTagComposite,
        id: 'de_dieploegers_followup_deferTag',
        initialValue: deferTagDefaultName
    });

    this.deferTagInput.setEnabled(false);

    this.deferTagInput.setData("deferTagId", deferTagDefaultId);

    deferTagSelect = new DwtButton({
        parent: deferTagComposite
    });

    deferTagSelect.addSelectionListener(
        new AjxListener(
            this,
            this.handleSelectTag
        )
    );

    deferTagSelect.setText(this.getMessage("LABEL_SELECTDEFERTAG"));

    zimletProperties.addProperty(
        this.getMessage("LABEL_DEFERTAG"),
        deferTagComposite,
        true
    );

    // Show Info?

    this.showInfoPaneCheck = new DwtCheckbox({
        parent: this.propertyEditorView,
        value: true,
        checked: this.showInfoPane
    });

    zimletProperties.addProperty(
        this.getMessage("LABEL_SHOWINFOPANE"),
        this.showInfoPaneCheck,
        false
    );

    // Use small toolbar icon? (for lower resolutions)

    this.useSmallIconCheck = new DwtCheckbox({
        parent: this.propertyEditorView,
        value: true,
        checked: this.useSmallIcon
    });

    zimletProperties.addProperty(
        this.getMessage("LABEL_USESMALLICON"),
        this.useSmallIconCheck,
        false
    );

    // Create dialog

    this.propertyEditorDialog = this._createDialog({
        title: this.getMessage("DIALOG_PROPERTIES_TITLE"),
        view: this.propertyEditorView,
        standardButtons: [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]
    });
    this.propertyEditorDialog.setButtonListener(DwtDialog.OK_BUTTON,
        new AjxListener(this, this.propertyEditorOk));

    this.propertyEditorDialog.setButtonListener(DwtDialog.CANCEL_BUTTON,
        new AjxListener(this, function (ev) {
            this.propertyEditorDialog.popdown();
        })
    );

    this.propertyEditorDialog.popup();

};

/**
 * Update the metadata of an once-deferred mail (is called after loading
 * the metadata)
 *
 * @param message      ZmMailMsg-Object of the mail
 * @param deferPIT     Current PIT
 * @param originalDate Original date of the mail
 * @param result       Load Metadata-Result
 */

de_dieploegers_followupHandlerObject.prototype.updateMetaData =
function(message, deferPIT, originalDate, result) {

    var log,
        response, deferMetaData, metadata;

    // Did we have any metadata?

    if (result instanceof ZmCsfeResult) {

        response =
            result.getResponse().BatchResponse.GetCustomMetadataResponse[0];

        if (response.meta && response.meta[0]) {

            deferMetaData = response.meta[0]._attrs;

        } else {

            // No, create metadata

            return this.createMetaData(message, deferPIT, originalDate);

        }

    } else {

        return;

    }

    // Safety check.

    try {

        log = JSON.parse(deferMetaData.log);

    } catch (e) {

        log = [];

    }

    // Add the current defer to the log and marshall the log in JSON

    log.push({
        at: new Date().getTime(),
        until: deferPIT
    });

    deferMetaData.log = JSON.stringify(log);

    metadata = new ZmMetaData(appCtxt.getActiveAccount(), message.id);

    // Save the metadata

    metadata.set("de_dieploegers_followup", deferMetaData);

};
