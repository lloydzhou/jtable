/************************************************************************
* FILTER extension for jTable                                    *
*************************************************************************/
(function ($) {

    //Reference to base object members
    var base = {
        _create: $.hik.jtable.prototype._create
    };

    //extension members
    $.extend(true, $.hik.jtable.prototype, {

        /************************************************************************
        * DEFAULT OPTIONS / EVENTS                                              *
        *************************************************************************/
        options: {

            //Events
            filterApplied: function (event, data) { },

            //Localization
            messages: {
                filter: 'Filter',
				apply: 'Search'
            }
        },

        /************************************************************************
        * PRIVATE FIELDS                                                        *
        *************************************************************************/

        _$filterRecordDiv: null, //Reference to the adding new record dialog div (jQuery object)

        /************************************************************************
        * CONSTRUCTOR                                                           *
        *************************************************************************/

        /* Overrides base method to do create-specific constructions.
        *************************************************************************/
        _create: function () {
            base._create.apply(this, arguments);
            this._createFilterRecordDialogDiv();
        },

        /* Creates and prepares add new record dialog div
        *************************************************************************/
        _createFilterRecordDialogDiv: function () {
            var self = this;

            //Create a div for dialog and add to container element
            self._$filterRecordDiv = $('<div />')
                .appendTo(self._$mainContainer);

            //Prepare dialog
            self._$filterRecordDiv.dialog({
                autoOpen: false,
                show: self.options.dialogShowEffect,
                hide: self.options.dialogHideEffect,
                width: 'auto',
                minWidth: '300',
                modal: true,
                title: self.options.messages.filter,
                buttons:
                        [{ //Cancel button
                            text: self.options.messages.cancel,
                            click: function () {
                                self._$filterRecordDiv.dialog('close');
                            }
                        }, { //Save button
                            id: 'AddRecordDialogApplyButton',
                            text: self.options.messages.apply,
                            click: function () {
                                var $saveButton = $('#AddRecordDialogApplyButton');
                                var $filterRecordForm = self._$filterRecordDiv.find('form');

                                if (self._trigger("formSubmitting", null, { form: $filterRecordForm, formType: 'filter' }) != false) {
                                    self._setEnabledOfDialogButton($saveButton, false, self.options.messages.saving);
                                    self._savefilterRecordForm($filterRecordForm, $saveButton);
                                }
                            }
                        }],
                close: function () {
                    var $filterRecordForm = self._$filterRecordDiv.find('form').first();
                    var $saveButton = $('#AddRecordDialogApplyButton');
                    self._trigger("formClosed", null, { form: $filterRecordForm, formType: 'filter' });
                    self._setEnabledOfDialogButton($saveButton, true, self.options.messages.save);
                    $filterRecordForm.remove();
                }
            });

            if (self.options.filterRecordButton) {
                //If user supplied a button, bind the click event to show dialog form
                self.options.filterRecordButton.click(function (e) {
                    e.preventDefault();
                    self._showFilterRecordForm();
                });
            } else {
                //If user did not supplied a button, create a 'add record button' toolbar item.
                self._addToolBarItem({
                    icon: true,
                    cssClass: 'jtable-toolbar-item-add-record',
                    text: self.options.messages.filter,
                    click: function () {
                        self._showFilterRecordForm();
                    }
                });
            }
        },

        /************************************************************************
        * PUBLIC METHODS                                                        *
        *************************************************************************/

        /* Shows add new record dialog form.
        *************************************************************************/
        showCreateForm: function () {
            this._showFilterRecordForm();
        },

       
        /************************************************************************
        * PRIVATE METHODS                                                       *
        *************************************************************************/

        /* Shows filter record dialog form.
        *************************************************************************/
        _showFilterRecordForm: function () {
            var self = this;

            //Create filter record form
            var $filterRecordForm = $('<form id="jtable-filter-form" class="jtable-dialog-form jtable-filter-form" action="' + self.options.actions.listAction.url + '" method="' + self.options.actions.listAction.type + '"></form>');

            //Create input elements
            for (var i = 0; i < self._fieldList.length; i++) {

                var fieldName = self._fieldList[i];
                var field = self.options.fields[fieldName];

                //Do not create input for fields that is key and not specially marked as creatable
                if (field.key == true && field.filter != true) {
                    continue;
                }

                //Do not create input for fields that are not creatable
                if (field.filter == false) {
                    continue;
                }

                if (field.type == 'hidden') {
                    $filterRecordForm.append(self._createInputForHidden(fieldName, field.defaultValue));
                    continue;
                }

                //Create a container div for this input field and add to form
                var $fieldContainer = $('<div />')
                    .addClass('jtable-input-field-container')
                    .appendTo($filterRecordForm);

                //Create a label for input
                $fieldContainer.append(self._createInputLabelForRecordField(fieldName));

                //Create input element
                $fieldContainer.append(
                    self._createInputForRecordField({
                        fieldName: fieldName,
                        formType: 'filter',
                        form: $filterRecordForm
                    }));
            }

            self._makeCascadeDropDowns($filterRecordForm, undefined, 'filter');

            //Open the form
            self._$filterRecordDiv.append($filterRecordForm).dialog('open');
            self._trigger("formCreated", null, { form: $filterRecordForm, formType: 'filter' });
        },

        /* Saves new added record to the server and updates table.
        *************************************************************************/
        _savefilterRecordForm: function ($filterRecordForm, $saveButton) {
            var self = this;
            var _url = self.options.actions.listAction.url || self.options.actions.listAction;
            var _type = self.options.actions.listAction.type || self.options.ajaxSettings.type;

            //Make an Ajax call to update record
            $filterRecordForm.data('submitting', true);

			self.load($filterRecordForm.serialize(), function () {
				self._$filterRecordDiv.dialog("close");
			});
        }

    });

})(jQuery);
