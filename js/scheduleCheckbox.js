class ScheduleCheckbox {

  constructor() {
    this.currentSchedules = {};
    this.newScheduleCheckmarks = {};
    this.execute();
  }

  execute() {
    let ScheduleClass = this;
    $(document).ready(function () {
      if (window.location.pathname.includes("/kurssit") && Session.getUserId() !== undefined) {
        if (document.getCookie('teacher') === 'true') {
          console.log("Course ID hardcoded!!");
          ScheduleClass._getSchedulesFromServer('1');
        }
      }
    });
  }

  _getSchedulesFromServer(courseID) {
    let ScheduleClass = this;
    backend.get(`courses/${courseID}/schedules`)
      .then(
        function fulfilled(data) {
          ScheduleClass.currentSchedules = data;
          ScheduleClass.newScheduleCheckmarks = ScheduleClass._getEmptyScheduleCheckmarksDeltaObject();
          scheduleCheckbox.createScheduleCheckboxes();
        },
        function rejected() {
          console.warn("Error, could not get schedule");
        });
  }

  _getEmptyScheduleCheckmarksDeltaObject() {
    let schedulesIDs = this._getScheduleIDs();
    let newScheduleCheckmarksObject = {};
    newScheduleCheckmarksObject['schedules'] = {};
    schedulesIDs.forEach(function(scheduleId) {
      newScheduleCheckmarksObject.schedules[scheduleId] = {};
    });
    return newScheduleCheckmarksObject;
  };

  _getScheduleIDs() {
    let scheduleIDs = [];
    this.currentSchedules.forEach(function(singleSchedule) {
      scheduleIDs.push(singleSchedule.id);
    });
    return scheduleIDs;
  }

  createScheduleCheckboxes() {
    this._renderEmptyCheckboxesForSchedules();
    this._populateScheduleCheckboxes();
    this._addScheduleCheckboxClickHandlers();
  }

  /**
   * Adds goal checkboxes to each exercise
   */
  _renderEmptyCheckboxesForSchedules() {
    let ScheduleCheckbox = this;
    this.currentSchedules.forEach(function(scheduleObject) {
      let colorString = ScheduleCheckbox._convertColorIdToColorString(scheduleObject.color);
      let scheduleId = scheduleObject.id;
      view.renderEmptyCheckboxesForOneSchedule(scheduleId, colorString);
    });
  };

  /**
   * Set checkmarks as "checked" according to current scheduleData
   * @param listOfCurrentSchedules: list of current schedule objects
   */
  _populateScheduleCheckboxes() {
    let ScheduleCheckbox = this;
    this.currentSchedules.forEach(function(scheduleObject) {
      scheduleObject.exercises.forEach(function (exerciseUUID) {
        let checkboxElement = ScheduleCheckbox._getExerciseCheckboxObject(exerciseUUID, scheduleObject.color);
        ScheduleCheckbox._setCheckboxChecked(checkboxElement);
      })
    });
  }

  /**
   * Get a checkbox element of a exercise
   * @param exerciseId (uuid)
   * @param colorId (integer)
   * @returns jQuery object: <div class="checkbox-bootstrap...">
   */
  _getExerciseCheckboxObject(exerciseId, colorId) {
    let colorString = this._convertColorIdToColorString(colorId);
    return $("#" + exerciseId).find(".checkbox-bootstrap.checkbox-" + colorString + ".checkbox-lg");
  }

  /**
   * Set a checkbox as 'checked'
   * @param exerciseId (uuid)
   * @param goalColorId (integer)
   */
  _setCheckboxChecked(checkboxElement) {
    checkboxElement.find("input").prop('checked', true);
  }

  _addScheduleCheckboxClickHandlers() {
    let ScheduleCheckbox = this;
    $('.checkbox-kisalli').find('input').click(function() {
      let checkboxInputElement = this;
      let checkboxScheduleID = checkboxInputElement.id;
      let checkboxExerciseUUID = checkboxInputElement.closest(".tehtava").id;
      let checkboxIsChecked = checkboxInputElement.checked;
      ScheduleCheckbox._setScheduleChange(checkboxScheduleID, checkboxExerciseUUID, checkboxIsChecked);
      ScheduleCheckbox._showAlertForUnsavedChanges();
    });
  };

  _setScheduleChange(scheduleID, exerciseUUID, isChecked) {
    this.newScheduleCheckmarks.schedules[scheduleID][exerciseUUID] = isChecked;
    console.log(this.newScheduleCheckmarks);
  }

  _showAlertForUnsavedChanges() {
    console.log('UNSAVED CHANGES!')
    this._setElementsVisibleByClass('SaveScheduleChangesDiv');
  };

  _setElementsVisibleByClass(classname) {
    $('.'+classname).prop('style').display = 'inline-block';
  }

  _setElementsHiddenByClass(classname) {
    $('.'+classname).prop('style').display = 'none';
  }

  saveScheduleChanges() {
    console.log('saving not implemented!!');
    this._setElementsHiddenByClass('SaveScheduleChangesDiv');
    this._resetDeltaAndUpdateSchedules();
  }

  _resetDeltaAndUpdateSchedules() {
    console.log('Reseting changes!');
    this.newScheduleCheckmarks = this._getEmptyScheduleCheckmarksDeltaObject();
  }

  /**
   * Convert color id to string
   * @param colorId (integer)
   * @returns corresponding color in english
   */
  _convertColorIdToColorString(colorId) {
    let colorStringsForColorIds = {
      1: "brown", //#da9887
      2: "blue", //#87b2da
      3: "green", //#c4da87
      4: "orange", //#f9bb81
      5: "yellow" //#eae981
    };
    return colorStringsForColorIds[colorId];
  }

  /**
   * Creates a sample list of schedules
   * @returns List of schedule objests
   * @private
   */
  _createSampleSchedule() {
    let sampleScheduleGoalGreen = {
      id : 93,
      name : "GreenSchedule",
      color : 3,
      exercises :
        ["421bb053-5806-4ef2-afe1-03d628afb679",
          "a421458d-aedf-4f9f-a2c9-b01d7a2878a8",
          "ec569649-1589-42ca-9625-2233e27c1350"]
    };

    let sampleScheduleGoalOrange = {
      id : 94,
      name : "OrangeSchedule",
      color : 4,
      exercises :
        ["ec569649-1589-42ca-9625-2233e27c1350"]
    };

    return [sampleScheduleGoalGreen, sampleScheduleGoalOrange];
  }

}