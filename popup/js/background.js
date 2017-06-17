/**
 * Created by andrew on 12/4/2016.
 */

// Base variables

// Emoti categories
var categories = [];

// Maximum length of category names
var categoryLengthCeiling = 32;

// Maximum length of emoti
var emotiLengthCeiling = 32;

//Models
////

// Model of Emoti object.
// Used for short emoticons
function Emoti(emoti, category) {
    this.emoti = emoti;
    this.category = category;
}

//////

//Settings functions
////
function populateSettings() {
    chrome.storage.sync.get("settings", function(obj) {
        if (obj.settings['insert'] == 'true') {
            document.getElementById("emotiClickSettingsSelect").value = "true";
        }
        else {
            document.getElementById("emotiClickSettingsSelect").value = "false";
        }
    });
}

function saveSettings() {
    var insertOnClick = document.getElementById("emotiClickSettingsSelect").value;
    var settingsObject = {"settings": {
        'insert': insertOnClick
        }
    };
    chrome.storage.sync.set(settingsObject, function(){
        displayStatusMessage("Settings saved.", "emotiStatusMessage");
        hideSettingsMenu();
        populateCategories();
        document.getElementById("emotiClickSettingsSelect").value = insertOnClick;
        });
}


function initBaseVariables() {
    chrome.storage.sync.get("categories", function(categories) {
        if ('categories' in categories) {
            populateCategories();
            addStaticUIEventListeners();
        }
        else {
            chrome.storage.sync.set({"categories" : []}, function() {
                populateCategories();
                addStaticUIEventListeners();
            })
        }

    });

    chrome.storage.sync.get("settings", function(settings) {
        if ('settings' in settings) {

        }
        else {
            chrome.storage.sync.set({"settings": {
                "insert": true}
            }, function() {
            })
        }

    })


}

//////

// Emoti functions
////

function initEmoti(category, emotiArray) {
    chrome.storage.sync.get(category, function(obj) {
        var oldEmotis = obj[category];
        if (oldEmotis != undefined) {
            emotiArray.forEach(function(item) {
                if (emotiIsUnique(item, oldEmotis)) {
                    oldEmotis.push(item);
                }
            });
            chrome.storage.sync.set({category: oldEmotis}, function() {
            });
        }
        else {
            var newObj = {};
            newObj[category] = emotiArray;
            chrome.storage.sync.set(newObj, function() {
            });
        }
    });
}

// Creates a list of base emotis.
// This is only run on first installation or when Emoti is reset to base settings.
function initBaseEmoti() {

    chrome.storage.sync.get("categories", function(obj) {
        var newCategories = [
            "happy",
            "sad",
            "angry",
            "confused",
            "tables",
            "misc"
        ];
        var oldCategories = obj.categories;


        newCategories.forEach(function(item) {
            if (oldCategories.indexOf(item) == -1) {
                oldCategories.push(item);
            }
        });
        chrome.storage.sync.set({"categories": oldCategories}, function(){

        });
    });

    var oldEmotis = [];

    var happyEmotis = [
        new Emoti("=)", "happy"),
        new Emoti(":‑)", "happy"),
        new Emoti(":D", "happy"),
        new Emoti("ʕʘ‿ʘʔ", "happy"),
        new Emoti("(/◔ ◡ ◔)/", "happy"),
        new Emoti("( ‘-’)人(ﾟ_ﾟ ) ", "happy"),
        new Emoti("(＾ｖ＾)", "happy"),
        new Emoti("(#^.^#)", "happy")
    ];

    var sadEmotis = [
        new Emoti("=(", "sad"),
        new Emoti("◉︵◉", "sad"),
        new Emoti("Q_Q", "sad"),
        new Emoti("＿|￣|○", "sad"),
        new Emoti("((´д｀))", "sad"),
        new Emoti("ಠ╭╮ಠ", "sad"),
        new Emoti("(◕︿◕✿)", "sad"),
        new Emoti("ʕ ಡ ﹏ ಡ ʔ", "sad")
    ];

    var angryEmotis = [
        new Emoti(">.<", "angry"),
        new Emoti("ಠ_ಠ", "angry"),
        new Emoti("ヽ(#`Д´)ﾉ", "angry"),
        new Emoti("o(>< )o", "angry"),
        new Emoti("＼(｀0´)／", "angry"),
        new Emoti("(ノಠ益ಠ)ノ", "angry"),
        new Emoti("ヽ(｀⌒´メ)ノ", "angry")
    ];

    var confusedEmotis = [
        new Emoti("¯\\_(ツ)_/¯", "confused"),
        new Emoti("¯\\\\_(ツ)_/¯", "confused"),
        new Emoti("(・・。)ゞ", "confused"),
        new Emoti("(-_-)ゞ゛", "confused")
    ];

    var tableEmotis = [
        new Emoti("(╯°□°）╯︵ ┻━┻", "tables"),
        new Emoti("┬─┬ ノ( ^_^ノ)", "tables"),
        new Emoti("┻━┻ ︵ヽ(`□´)ﾉ︵﻿ ┻━┻", "tables"),
        new Emoti(" (ノಠ益ಠ)ノ彡┻━┻", "tables")
    ];

    var miscEmoti = [
        new Emoti(".....φ(・∀・＊)", "misc"),
        new Emoti("♪┏(・o･)┛♪┗ ( ･o･) ┓", "misc"),
        new Emoti("(☞ﾟヮﾟ)☞", "misc")
    ];

    initEmoti("happy", happyEmotis);
    initEmoti("sad", sadEmotis);
    initEmoti("angry", angryEmotis);
    initEmoti("confused", confusedEmotis);
    initEmoti("tables", tableEmotis);
    chrome.storage.sync.get("misc", function(obj) {
        var oldEmotis = obj.misc;
        if (oldEmotis != undefined) {
            miscEmoti.forEach(function(item) {
                if (emotiIsUnique(item, oldEmotis)) {
                    oldEmotis.push(item);
                }
            })
            chrome.storage.sync.set({"misc": oldEmotis}, function() {
                populateCategories();
                hideBaseEmotiDiv();
            });
        }
        else {
            var newObj = {};
            newObj["misc"] = miscEmoti;
            chrome.storage.sync.set(newObj, function() {
                populateCategories();
                hideBaseEmotiDiv();
            });
        }
    });


}

// Returns true if the Emoti is unique within its category
function emotiIsUnique(emoti, emotiArray) {
    for (var i = 0; i < emotiArray.length; i++) {
        if (emotiArray[i].emoti == emoti.emoti) {
            return false;
        }
    }
    return true;
}

// Collects data form the emoti add form and saves a new emoti into storage if possible.
function saveNewEmoti() {

    var emotiText = document.getElementById("addEmotiText").value;
    var emotiCategory = document.getElementById("addEmotiCategory").value;
    var emotiCategoryText = document.getElementById("addEmotiCategoryText").value;
    var newCategory = false;
    if (emotiCategory == "noCategory") {
        displayAddErrorMessage("A category must be selected");
        return false;
    }
    else if (emotiCategory == "newCategory") {
        if (document.getElementById("addEmotiCategoryText").value == "") {
            displayAddErrorMessage("A new category must be created");
            return false;
        }

        else if (checkCategoryLength(emotiCategoryText)) {
            if (!checkIfCategoryIsUnique(emotiCategoryText)) {
                displayAddErrorMessage("This category already exists.");
                return false;
            }
            newCategory = true;
        }
        else {
            return false;
        }


    }

    var emoti = new Emoti(emotiText, emotiCategory);
    if (!checkEmotiLength(emoti.emoti)) {
        return false;
    }
    if (newCategory == true) {

        chrome.storage.sync.get("categories", function(items){
            var newCategoryText = document.getElementById("addEmotiCategoryText").value;
            var newCategories = items.categories;
            newCategories.push(newCategoryText);
            chrome.storage.sync.set({"categories": newCategories}, function() {
                var newEmotiObject = {};
                emoti.category = newCategoryText;
                newEmotiObject[newCategoryText] = [emoti];
                chrome.storage.sync.set(newEmotiObject, function() {
                    displayStatusMessage("Saved emoti: " + emoti.emoti, "emotiStatusMessage");
                    hideAddEmotiForm();
                    populateCategories();
                });
            });
        });


    }
    else {
            chrome.storage.sync.get(emotiCategory, function(items){
                if (emotiIsUnique(emoti, items[emotiCategory])) {
                    var newEmotisObject = {};
                    items[emotiCategory].push(emoti);
                    newEmotisObject[emotiCategory] = items[emotiCategory];
                    chrome.storage.sync.set(newEmotisObject, function() {
                        hideAddEmotiForm();
                        displayStatusMessage("Saved emoti: " + emoti.emoti, "emotiStatusMessage");
                        populateCategories();
                    });
                }

                else {
                    displayAddErrorMessage("Emoti must be unique within its category.")
                }

            });



    }
}

function deleteEmoti() {
    var category = this.alt;
    var emoti = this.name;
    chrome.storage.sync.get(category, function (obj) {
        var newEmotis = removeEmotiFromArray(emoti, obj[category]);
        var newObj = {};
        newObj[category] = newEmotis;
        chrome.storage.sync.set(newObj, function () {
            displayStatusMessage(document.getElementById('i' + emoti).innerHTML + " removed", "emotiStatusMessage");
            document.getElementById('h' + emoti).remove();

        });
    });

}

function populateEmotisByCategory(categoryString, emotiArray) {
    var insertOnClick = false;
    chrome.storage.sync.get("settings", function(settingsObj) {
        if (settingsObj.settings.insert == 'true') {
            insertOnClick = true;
        }
        if (emotiArray != undefined) {
            emotiArray.forEach(function(item, i){
                document.getElementById("cont" + categoryString).innerHTML +=
                    "<span id = 'h" + item.category + i + "' class = 'emotiHolder'><span id = 'i" + item.category + i + "' class = 'emoti'>" + item.emoti + "</span><img id = 'x" + item.category + i + "' class = 'deleteEmotiIcon' name = '" + item.category + i + "' alt = '" + categoryString + "' src = '/img/x.svg'><span>";
            });

            var emotiElements = document.querySelectorAll('.emoti');
            var clickFunction = insertOnClick ? insertEmoti : copyEmoti;
            for (var i = 0; i < emotiElements.length; i++) {
                emotiElements[i].addEventListener('click', clickFunction, false);
            }

            var deleteEmotiIcons = document.querySelectorAll('.deleteEmotiIcon');
            for (var n = 0; n < deleteEmotiIcons.length; n++) {
                deleteEmotiIcons[n].addEventListener('click', deleteEmoti);
            }
        }

    });
}

function populateAddEmotiCategories() {
    var addEmotiCategorySelector = document.getElementById("addEmotiCategory");
    addEmotiCategorySelector.innerHTML = "";
    addEmotiCategorySelector.innerHTML += "<option value='noCategory'>-- Choose a Category --</option>";
    if (categories.length > 0) {
        for (var i = 0; i < categories.length; i++) {
            addEmotiCategorySelector.innerHTML += "<option value='" + categories[i] + "'>" + categories[i] + "</option>"
        }
    }
    addEmotiCategorySelector.innerHTML += "<option value='newCategory'>---New Category---</option>";
    document.getElementById("addEmotiCategory").addEventListener('change', selectAddEmotiCategory);
}

// Displays a new category input text box when "new category" is selected on the add category menu
function selectAddEmotiCategory() {
    if (document.getElementById("addEmotiCategory").value == "newCategory") {
        document.getElementById("addEmotiCategoryText").style.display = "block";
    }
    else if (document.getElementById("addEmotiCategory").value == "noCategory") {
        document.getElementById("addEmotiCategoryText").style.display = "none";
    }
    else {
        document.getElementById("addEmotiCategoryText").style.display = "none";
    }
}
//////

// Category functions
////

function checkIfCategoryIsUnique(category) {
    for (var i = 0; i < categories.length; i++) {
        if (categories[i] === category) {
            return false;
        }
    }
    return true;
}

function deleteCategory() {
    var category = this.id;
    if (categories.includes(category)) {
        // Remove from Categories
        categories = removeFromArray(category, categories);

        chrome.storage.sync.get("categories", function () {
            chrome.storage.sync.set({"categories": categories}, function () {
            });
            chrome.storage.sync.remove(category, function () {
                document.getElementById('cont' + category).remove();
                document.getElementById('cat' + category).remove();
                document.getElementById('hr' + category).remove();
                displayStatusMessage(category + " removed.", "emotiStatusMessage");
                if (categories.length == 0) {
                    endEditMode();
                    showBaseEmotiDiv();
                }
            });
        });
    }
    else {
        displayStatusMessage("Can't remove " + category + " as it doesn't exist.", "emotiStatusMessage");
    }
}

// Gets the used categories and creates divs for each of them.
function populateCategories() {
    var newCategories = [];
    document.getElementById("emotiCategoryContainer").innerHTML = "";
    chrome.storage.sync.get(null, function(items) {
        var count = 0;
        for (var category in items) {
            if (items.hasOwnProperty(category)) {
                if (category != "categories" && category != "settings") {
                    newCategories.push(category);
                        document.getElementById("emotiCategoryContainer").innerHTML +=
                            "<span id = 'cat" + category + "' class = 'emotiCategoryContainerTitle'>" + category + "<img id = '" + category + "' src = '/img/x.svg' class = 'deleteCategoryIcon'></span><br>" +
                            "<span id = warning-" + category + " class = 'categoryDeleteWarning'>Deleting this category will remove all contained emotis. Continue?</span>" +
                            "<div id = 'cont" + category + "' class = 'emotiContainer'></div>" +
                            "<hr id = 'hr" + category + "' class = 'borderHR'>";
                        populateEmotisByCategory(category, items[category]);
                        count++;
                }
            }
        }
        categories = newCategories;
        if (count == 0) {
            showBaseEmotiDiv();
        }
        var deleteCategoryIcons = document.querySelectorAll('.deleteCategoryIcon');
        for (var i = 0; i < deleteCategoryIcons.length; i++) {
            deleteCategoryIcons[i].addEventListener('click', deleteCategory, false);
        }

    });

}
//////


// Util functions
////
// Returns a new array with the inputted value removed
function removeFromArray(value, array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i] != value) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}

// Returns a new array with the inputted emoti removed
function removeEmotiFromArray(value, array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i].emoti != value) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}

function unescapeHTML(escapedHTML) {
    return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
}

// Return false if category is above N length to ensure the window doesn't look like crap.
function checkCategoryLength(categoryString) {
    if (categoryString.length > categoryLengthCeiling) {
        displayAddErrorMessage("Category name is above " + categoryLengthCeiling + " characters. Try again with a shorter category name.");
        return false;
    }
    else if (categoryString.length <= 0) {
        displayAddErrorMessage("Category field cannot be empty");
        return false;
    }
    return true;
}

// Return false if emoti is above N length.
function checkEmotiLength(emotiString) {
    if (emotiString.length > emotiLengthCeiling) {
        displayAddErrorMessage("Emoti is above " + emotiLengthCeiling + " characters. Try again with a shorter emoti.");
        return false;
    }
    else if (emotiString.length <= 0) {
        displayAddErrorMessage("Emoti field cannot be empty");
        return false;
    }
    return true;
}
//////

// Status messaging
////
function displayStatusMessage(message, id) {
    document.getElementById(id).innerHTML = message;
    document.getElementById(id).style.visibility = "visible";
}

function hideStatusMessage(id) {
    document.getElementById(id).innerHTML = "";
    document.getElementById(id).style.visibility = "hidden";
}

function displayAddErrorMessage(message) {
    document.getElementById("addEmotiErrorMessage").style.display = "block";
    document.getElementById("addEmotiErrorMessage").innerHTML = message;
}

function hideAddErrorMessage() {
    document.getElementById("addEmotiErrorMessage").style.display = "none";
}

//////

// Insertion and copying
////
function insertEmoti() {

    var previousCopiedTextInput = document.getElementById("hiddenCopyBox");
    previousCopiedTextInput.select();
    document.execCommand('paste');
    var parsedText = document.getElementById("hiddenEmotiSelectBox").value = unescapeHTML(this.innerHTML);
    var copiedText = document.getElementById("hiddenEmotiSelectBox");
    copiedText.select();
    document.execCommand('Copy');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {emoti: parsedText}, function() {
            previousCopiedTextInput.select();
            document.execCommand('Copy');
            displayStatusMessage(copiedText.value + " inserted.", "emotiStatusMessage");
        });
    });
}

function copyEmoti() {
    var parsedText = document.getElementById("hiddenEmotiSelectBox").value = unescapeHTML(this.innerHTML);
    var copiedText = document.getElementById("hiddenEmotiSelectBox");
    copiedText.select();
    document.execCommand('Copy');
    displayStatusMessage(copiedText.value + " copied to clipboard.", "emotiStatusMessage");
}

////


// Display functions
////

// Shows the menu for adding Emotis when the 'add' button is clicked.
function displayAddEmotiMenu() {
    var addEmotiIcon = document.getElementById("addEmotiButton");
    hideSettingsMenu();
    endEditMode();
    populateAddEmotiCategories();
    document.getElementById("emotiAddForm").style.display = "block";
    addEmotiIcon.style.backgroundColor = "#B9FF9F";
    addEmotiIcon.removeEventListener('click', displayAddEmotiMenu, false);
    addEmotiIcon.addEventListener("click", hideAddEmotiForm);
}

// Closes the add Emoti form and clears its inputs.
function hideAddEmotiForm() {
    var addEmotiButton = document.getElementById("addEmotiButton");
    document.getElementById("emotiAddForm").style.display = "none";
    document.getElementById("addEmotiText").value = "";
    document.getElementById("addEmotiCategoryText").style.display = "none";
    document.getElementById("addEmotiCategoryText").value = "";
    document.getElementById("addEmotiErrorMessage").style.display = "none";
    addEmotiButton.style.backgroundColor = "";
    addEmotiButton.removeEventListener('click', hideAddEmotiForm, false);
    addEmotiButton.addEventListener("click", displayAddEmotiMenu);
    hideAddErrorMessage();
}

function startEditMode() {
    if (categories.length == 0) {
        return;
    }

    var editEmotiIcon = document.getElementById("editEmotiButton");
    hideSettingsMenu();
    hideAddEmotiForm();
    var deleteCategoryIcons = document.querySelectorAll('.deleteCategoryIcon');
    for (var i = 0; i < deleteCategoryIcons.length; i++) {
        deleteCategoryIcons[i].style.visibility = "visible";
    }
    var deleteEmotiIcons = document.querySelectorAll('.deleteEmotiIcon');
    for (var n = 0; n < deleteEmotiIcons.length; n++) {
        deleteEmotiIcons[n].style.visibility = "visible";
    }
    editEmotiIcon.style.backgroundColor = "#B9FF9F";
    editEmotiIcon.removeEventListener('click', startEditMode, false);
    editEmotiIcon.addEventListener("click", endEditMode);


}

function endEditMode() {
    var editEmotiIcon = document.getElementById("editEmotiButton");
    var deleteCategoryIcons = document.querySelectorAll('.deleteCategoryIcon');
    for (var i = 0; i < deleteCategoryIcons.length; i++) {
        deleteCategoryIcons[i].style.visibility = "hidden";
    }
    var deleteEmotiIcons = document.querySelectorAll('.deleteEmotiIcon');
    for (var n = 0; n < deleteEmotiIcons.length; n++) {
        deleteEmotiIcons[n].style.visibility = "hidden";
    }
    editEmotiIcon.style.backgroundColor = "";
    editEmotiIcon.removeEventListener('click', endEditMode, false);
    editEmotiIcon.addEventListener("click", startEditMode);
    hideStatusMessage("emotiStatusMessage");
}

function showBaseEmotiDiv() {
    document.getElementById("initBaseEmotiDiv").style.display = "inline-block";
}

function hideBaseEmotiDiv() {
    document.getElementById("initBaseEmotiDiv").style.display = "none";
}

function displaySettingsMenu() {
    var settingsIcon = document.getElementById("settingsEmotiButton");
    hideAddEmotiForm();
    endEditMode();
    populateSettings();
    document.getElementById("settingsForm").style.display = "block";
    settingsIcon.style.backgroundColor = "#B9FF9F";
    settingsIcon.removeEventListener('click', displaySettingsMenu, false);
    settingsIcon.addEventListener("click", hideSettingsMenu);
}

function hideSettingsMenu() {
    var settingsIcon = document.getElementById("settingsEmotiButton");
    document.getElementById("settingsForm").style.display = "none";
    settingsIcon.style.backgroundColor = "";
    settingsIcon.removeEventListener('click', hideSettingsMenu, false);
    settingsIcon.addEventListener("click", displaySettingsMenu);
    hideAddErrorMessage();
}

//////


// Initialization functions
////

// Adds event listeners to elements that are not dynamically generated and can be safely added at runtime.
function addStaticUIEventListeners() {
    document.getElementById("addEmotiButton").addEventListener("click", displayAddEmotiMenu);
    document.getElementById("submitAddEmotiButton").addEventListener("click", saveNewEmoti);
    document.getElementById("cancelAddEmotiButton").addEventListener("click", hideAddEmotiForm);
    document.getElementById("editEmotiButton").addEventListener("click", startEditMode);
    document.getElementById("settingsEmotiButton").addEventListener("click", displaySettingsMenu);
    document.getElementById("saveSettingsButton").addEventListener("click", saveSettings);
    document.getElementById("discardSettingsButton").addEventListener("click", hideSettingsMenu);
    document.getElementById("saveSettingsButton").addEventListener("click", saveSettings);
    document.getElementById("initBaseEmotiButton").addEventListener("click", initBaseEmoti);
    document.getElementById("cancelInitBaseEmotiButton").addEventListener("click", hideBaseEmotiDiv);
    // chrome.storage.onChanged.addListener(populateCategories());
}

////Initialization functions
// Initializes the program when popup.html is opened.
function init() {
    initBaseVariables();
}

// Begins the program
init();