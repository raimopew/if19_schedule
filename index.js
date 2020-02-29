/* jshint esversion: 6 */

let currentTab;
let params;

let day = new Date().getDay();
let days = ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"];

let jsonUrl = "data.json";

let data = $.ajax({
    url: jsonUrl,
    async: false,
    dataType: 'json'
}).responseJSON;

let oddOrEvenWeek = getNumberOfWeek() % 2;

$(document).ready(() => {
    params = new URLSearchParams(window.location.search);

    if (!params.has("theme") && !params.has("group")) {
        params.append("group", "1");
        params.append("showIcons", "false");
        updateSearchParams();
    }

    if (params.get("group") == 1) {
        checkedTab(true, false, false);
    } else if (params.get("group") == 2) {
        checkedTab(false, true, false);
    } else if (params.get("group") == 3) {
        checkedTab(false, false, true);
    }

    $('#tab-1').on('click', () => {
        updateGroup("1");
    });
    $('#tab-2').on('click', () => {
        updateGroup("2");
    });
    $('#tab-3').on('click', () => {
        updateGroup("3");
    });

    createContent(data.first, "table1");
    createContent(data.second, "table2");
    createContent(data.third, "table3");
    highlightDay();

    $('[data-toggle="popover"]').popover({
        trigger: 'click',
        container: 'body',
        placement: 'auto',
        html: true,
    });

    $('[data-toggle="popover"]').on('click', function (e) {
        $('[data-toggle="popover"]').not(this).popover('hide');
    });

    if (params.get("showIcons") === "false") {
        toggleImages("false");
    } else if (params.get("showIcons") === "true") {
        toggleImages("true");
    }

    $('.toggleImg').on('click', () => {
        params.get("showIcons") === "true" ? toggleImages("false") : toggleImages("true");
    });

});

function toggleImages(string) {
    if (string === "true") {
        $('.icon').show();
        $('.toggleImg').html("Hide icons");
        $('.room').css("padding-right", "0px");
    } else if (string === "false") {
        $('.icon').hide();
        //$('.toggleImg').html("Show icons");
        $('.room').css("padding-right", "5px");
    }
    params.set("showIcons", string);
    updateSearchParams();
}

function updateSearchParams() {
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
}

function updateGroup(number) {
    if (params.has("group")) {
        params.set("group", number);
    } else {
        params.append("group", number);
    }
    updateSearchParams();
    hideAllPopovers();
}

function hideAllPopovers() {
    $('[data-toggle="popover"]').not(this).popover('hide');
}

function createContent(group, target) {

    let columnStart = 1, columnEnd = 2;
    let rowStart = 1, rowEnd = 2;

    $.each(group, function (i) {
        let span = createSpan(days[i + 1]);

        createSubjectDiv(rowStart, rowEnd, columnStart, columnEnd, span, "tableHeader", target);

        $.each(this, function (y) {
            let currentDiv = document.createElement("div");
            currentDiv.className = "inner";

            let rowStart, rowEnd, time, p;
            let subject = "";
            let room = "";

            if (group[i][y].week === oddOrEvenWeek || group[i][y].week === 2) {

                if (group[i][y].id.length > 0) {
                    let appendOnce = true;

                    $.each(group[i][y].id, (x) => {
                        time = data.subjects[this.id[x]].times[this.time];
                        if (appendOnce) {
                            appendOnce = false;
                            currentDiv.append(createSpan(time, "time"));
                        }
                        room = data.subjects[this.id[x]].rooms[this.room[x]];
                        subject = data.subjects[this.id[x]].name;
                        roomAndSubject = room + " " + subject;

                        p = createSpan(room, "room" + " " + this.id[x]);
                        currentDiv.append(p);
                        currentDiv.append(createSpan(subject, this.id[x], true));
                    });

                } else {

                    time = data.subjects[group[i][y].id].times[group[i][y].time];
                    room = data.subjects[group[i][y].id].rooms[group[i][y].room];
                    subject = data.subjects[group[i][y].id].name;

                    currentDiv.append(createSpan(time, "time"));
                    currentDiv.append(createSpan(room, "room" + " " + group[i][y].id));
                    currentDiv.append(createSpan(subject, group[i][y].id, true));

                }

                rowStart = group[i][y].start;
                rowEnd = group[i][y].end;

                createSubjectDiv(rowStart, rowEnd, columnStart, columnEnd, currentDiv, "handdrawnbox " + days[i + 1], target);

            }

        });

        columnStart += 1;
        columnEnd += 1;

    });
}

function createSubjectDiv(rowStart, rowEnd, columnStart, columnEnd, contentCombined, divClass, target) {

    let div = document.createElement("div");
    div.setAttribute("style", "grid-row: " + rowStart + " / " + rowEnd + "; grid-column: " + columnStart + " / " + columnEnd + ";");
    div.className = divClass;
    div.appendChild(contentCombined);
    let currentDiv = document.getElementById(target);

    currentDiv.appendChild(div);
}

function createSpan(content, className, popover) {
    let span = document.createElement("span");
    let icon;
    if (typeof className !== 'undefined') span.className = className;
    if (popover) {
        // enable this when icons added
        /*
        icon = document.createElement("img");
        icon.src = "icons/subjecticons/" + data.subjects[className].icon;
        icon.className = "icon";
        */

        if (!isNaN(className)) span.classList.add("subject");

        span.setAttribute("tabindex", "0");
        span.setAttribute("role", "button");
        span.setAttribute("data-toggle", "popover");

        let link = "";
        if (data.subjects[className].links.length > 1) {
            $.each(data.subjects[className].links, (index, element) => {
                link += '<a target="_blank" class="aPopover" href="' + element[0] + '">' + element[1] + '</a>';
                if (data.subjects[className].links.length - 1 !== index) {
                    link += "<br>";
                }
            });
        } else {
            if (data.subjects[className].links[0][1] !== "null") {
                link = '<a target="_blank" class="aPopover" href="' + data.subjects[className].links[0][0] + '">' + data.subjects[className].links[0][1] + '</a>';
            } else {
                link = '<p>' + data.subjects[className].links[0][1] + '</p>'
            }

        }
        span.setAttribute("data-content", link);
    }
    span.innerHTML = content;

    // enable this when icons added
    /* if (typeof icon !== 'undefined'){
        span.prepend(icon);
    } */

    return span;
}

function checkedTab(statement1, statement2, statement3) {
    $('#tab-1').attr("checked", statement1);
    $('#tab-2').attr("checked", statement2);
    $('#tab-3').attr("checked", statement3);
}

function highlightDay() {
    if (day === 6 || day === 0) {
        $('#noHighlight').html("No highlight due to it being " + days[day]);
    } else {
        $('.handdrawnbox.' + days[day]);
        $('#noHighlight').html("Classes (if any) on " + days[day] + " highlighted");
    }
}

/* thanks to https://gist.github.com/IamSilviu/5899269#gistcomment-2773524 */
function getNumberOfWeek() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return (Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7));
}