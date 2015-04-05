/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var VERSION = 'v1.0';
var IS_DEBUG = false;

/**
 * Options for the RealTime loader.
 */
var realTimeOptions = {
  /**
   * Client ID from the API console.
   */
   // Production Client Id
   //clientId: "597181394454-vc9i6sa8k4jj6vutjui0kd10dnnvjllh.apps.googleusercontent.com",

   //Local Client Id
   clientId: "597181394454-dogbe836tp8mjtoq69og51qmmrj6psuh.apps.googleusercontent.com",

  /**
   * Application ID from the API console.
   */
   appId: 597181394454,

  /**
   * Function to be called when a RealTime model is first created.
   */
  initializeModel: initializeModel,

  /**
   * Function to be called every time a RealTime file is loaded.
   */
  onFileLoaded: onFileLoaded,

  /**
   * ID of the auth button.
   */
  authButtonElementId: 'authorizeButton',
  /**
   * Automatically create file after auth.
   */
  autoCreate: true,

  /**
   * Name of new files that gets created.
   */
  defaultTitle: 'Jockey'
};

function showShareDialog() {
  console.log("show share dialog");
  var shareClient = new gapi.drive.share.ShareClient(realTimeOptions.appId);
  shareClient.setItemIds(rtclient.params['fileId']);
  shareClient.showSettingsDialog();
}


function startJockey() {
  logDebug('Starting Jockey');
  var realTimeLoader = new rtclient.RealtimeLoader(realTimeOptions);
  realTimeLoader.start();
  // realTimeLoader.start(function(){document.getElementById("loading").style.display = ''});
}

var AXIS_X = 'x';
var AXIS_Y = 'y';
var AXIS_Z = 'z';

var MOVE_AXIS_KEY = 'axis';
var MOVE_LAYER_KEY = 'layer';
var MOVE_DIRECTION_KEY = 'dir'

var MOVES_KEY = 'moves';

var rubik;
var movesList;

var collabDoc;

var PLAYLIST = 'playlist';
var playlist;


/**
 * This function is called the first time that the RealTime model is created
 * for a file. This function should be used to initialize any values of the
 * model. In this case, we just create the single string model that will be
 * used to control our text box. The string has a starting value of 'Hello
 * RealTime World!', and is named 'text'.
 * @param model {gapi.drive.realtime.Model} the RealTime root model object.
 */
 
function initializeModel(model) {
  logDebug('initializeModel');
  model.getRoot().set(MOVES_KEY, model.createList());

  var string = model.createString('Jockey Rockeys');
  model.getRoot().set('text', string);

  model.getRoot().set(PLAYLIST, model.createList());
}

function updateForRealTimeDoneInitializing() {
  document.getElementById('collaborators').style.display = 'block';
}

/**
 * This function is called when the RealTime file has been loaded. It should
 * be used to initialize any user interface components and event handlers
 * depending on the RealTime model. In this case, create a text control binder
 * and bind it to our string model that we created in initializeModel.
 * @param doc {gapi.drive.realtime.Document} the RealTime document.
 */
function onFileLoaded(doc) {
  logDebug('onFileLoaded');
  collabDoc = doc;

  doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, onCollaboratorsChanged);
  doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, onCollaboratorsChanged);

  setTimeout(function() {
    updateForRealTimeDoneInitializing();
    setTimeout(function() {
      updateCollaborators();
    }.bind(this), 0);
  }.bind(this), 0);


  var model = doc.getModel();
  playlist = model.getRoot().get(PLAYLIST);

  playlist.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, addedToPlaylist);
  playlist.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, removedFromPlaylist);

  var string = doc.getModel().getRoot().get('text');

  // Keeping one box updated with a String binder.
  var textArea1 = document.getElementById('editor1');
  gapi.drive.realtime.databinding.bindString(string, textArea1);

  // Keeping one box updated with a custom EventListener.
  var textArea2 = document.getElementById('editor2');
  var updateTextArea2 = function(e) {
    textArea2.value = string;
  };
  string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateTextArea2);
  string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, updateTextArea2);
  textArea2.onkeyup = function() {
    string.setText(textArea2.value);
  };
  updateTextArea2();

  // Enabling UI Elements.
  textArea1.disabled = false;
  textArea2.disabled = false;
}

function addedToPlaylist(e) {

  console.log("added a song.");
}

function removedFromPlaylist(e) {

  console.log("removed a song.");
}

function onCollaboratorsChanged(e) {
  updateCollaborators();
}

function updateCollaborators() {
  logDebug('****updateCollaborators***');
  removeAbsentCollaborators();
  addPresentCollaborators();
}

function removeAbsentCollaborators() {
  // If there is a 'current' DOM session ID in the  that is not present in the
  // updated collaborators list, remove it.
  var updatedCollaborators = collabDoc.getCollaborators();
  var currentDomSessionIds = getCurrentCollaboratorSessionIdsByDom();
  for (var i = 0; i < currentDomSessionIds.length; i++) {
    var domSessionId = currentDomSessionIds[i];
    var found = false;
    for (var j = 0; i < updatedCollaborators.length; j++) {
      var updatedCollaborator = updatedCollaborators[j];
      if (domSessionId == updatedCollaborator.sessionId) {
        // Found, do not remove
        found = true;
        break;
      }
    }

    // Not found, remove from dom.
    if (!found) {
      removeCollaboratorBySessionId(domSessionId);
    }
  }
}

function addPresentCollaborators() {
  var newCollaborators = collabDoc.getCollaborators();
  for (var i = 0; i < newCollaborators.length; i++) {
    maybeAddCollaborator(newCollaborators[i]);
  }
  setTimeout(fadeInAllCollaborators, 0);
}

function fadeInAllCollaborators() {
  var collaborators = collabDoc.getCollaborators();
  for (var i = 0; i < collaborators.length; i++) {
    var collaboratorDiv = getCollaboratorDiv(collaborators[i]);
    collaboratorDiv.className += ' collaborator-shown';
  }
}

function maybeAddCollaborator(collaborator) {
  if (!collaboratorExists(collaborator)) {
    getCollaboratorsContainerDiv().appendChild(genCollaboratorDiv(collaborator));
  }
}

function maybeRemoveCollaborator(collaborator) {
  if (collaboratorExists(collaborator)) {
    getCollaboratorsContainerDiv().removeChild(getCollaboratorDiv(collaborator));
  }
}

function removeCollaboratorBySessionId(sessionId) {
  var divToRemove = getCollaboratorDivBySessionId(sessionId);
  getCollaboratorsContainerDiv().removeChild(divToRemove);
}

function getCurrentCollaboratorSessionIdsByDom() {
  var collaboratorChildren = getCollaboratorsContainerDiv().children;
  var sessionIds = [];
  for (var i = 0; i < collaboratorChildren.length; i++) {
    sessionIds.push(getSessionIdFromCollaboratorDiv(collaboratorChildren[i]));
  }
  return sessionIds;
}

function getSessionIdFromCollaboratorDiv(collaboratorDiv) {
  return collaboratorDiv.id.substring(collaboratorDiv.id.indexOf('_') + 1);
}

function genCollaboratorDiv(collaborator) {
  var collaboratorDiv = document.createElement('div');
  collaboratorDiv.id = getIdForCollaboratorDiv(collaborator);
  collaboratorDiv.setAttribute('class', 'collaborator');

  var collaboratorName = document.createElement('h1');
  collaboratorName.innerText = collaborator.displayName;

  var imgDiv = document.createElement('img');
  imgDiv.setAttribute('class', 'collaborator-image shadow');
  imgDiv.setAttribute('title', collaborator.displayName);
  imgDiv.setAttribute('alt', collaborator.displayName);
  imgDiv.setAttribute('src', collaborator.photoUrl);

  collaboratorDiv.appendChild(collaboratorName);
  collaboratorDiv.appendChild(imgDiv);
  return collaboratorDiv;
}

function getCollaboratorsContainerDiv() {
  return document.getElementById('collaborators-container');
}

function collaboratorExists(collaborator) {
  return !!getCollaboratorDiv(collaborator);
}

function getCollaboratorDiv(collaborator) {
  return getCollaboratorDivBySessionId(collaborator.sessionId);
}

function getCollaboratorDivBySessionId(sessionId) {
  return document.getElementById(getIdForCollaboratorDivBySessionId(sessionId));
}

function getIdForCollaboratorDiv(collaborator) {
 return getIdForCollaboratorDivBySessionId(collaborator.sessionId);
}

function getIdForCollaboratorDivBySessionId(sessionId) {
 return 'collaborator_' + sessionId;
}

function logDebug(msg) {
  if (IS_DEBUG) {
    window.console.debug(msg);
  }
}


// JQUERY CODE //

$(function() {
  $('body').on('click', '#search-results li', function() {
      var url = $(this).find("p:first").text();
      console.log(url)
  });
});
