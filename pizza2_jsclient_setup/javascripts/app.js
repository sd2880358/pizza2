"use strict";
// avoid warnings on using fetch and Promise --
/* global fetch, Promise */
// use port 80, i.e., apache server for webservice execution 
// Change localhost to localhost:8000 to use the tunnel to pe07's port 80
const baseUrl = "http://localhost/cs637/eoneil1/pizza2_server/api";
// globals representing state of data and UI
let selectedUser = 'none';
let sizes = [];
let toppings = [];
let users = [];
let orders = [];
let main = function () {//(sizes, toppings, users, orders) {
    setupTabs();  // for home/order pizza 
    // for home tab--
    displaySizesToppingsOnHomeTab();
    setupUserForm();
    setupRefreshOrderListForm();
    setupAcknowledgeForm();
    displayOrders();
    // for order tab--
    setupOrderForm();
    displaySizesToppingsOnOrderForm();
};

// Suggested step 1: implement this, should see sizes displayed
// Suggested step 2: implement get_toppings, etc. so this shows toppings too
function displaySizesToppingsOnHomeTab() {
    // find right elements to build lists in the HTML
    // loop through sizes, creating <li>s for them
    // with class=horizontal to get them to go across horizontally
    // similarly with toppings
}

// Suggested step 3: implement this, and get_users
function setupUserForm() {
    // find the element with id userselect
    // create <option> elements with value = username, for
    // each user with the current user selected, 
    // plus one for user "none".
    // Add a click listener that finds out which user was
    // selected, make it the "selectedUser", and fill it in the
    //  "username-fillin" spots in the HTML.
    //  Also change the visibility of the order-area
    // and redisplay the orders
}

// suggested step 7, and needs update_order
function setupAcknowledgeForm() {
    console.log("setupAckForm...");
    document.querySelector("#ackform input").addEventListener("click", event => {
        console.log("ack by user = " + selectedUser);
        // find this user's info in users, and their selectedUserId
        selectedUserId = 6; // bogus value for now
        orders.forEach(function (order) {
            console.log("cking order = %O", order);
            if (order.user_id == selectedUserId && order.status === 'Baked') {
                console.log("Found baked order for user " + order.username);
                order.status = 'Finished';
                updateOrder(order, () => console.log("back from fetch for upd")); // post update to server
            }
        });
        displayOrders();
        event.preventDefault();
    });
}

// suggested steps: this should work once displayOrders works
function setupRefreshOrderListForm() {
    console.log("setupRefreshForm...");
    document.querySelector("#refreshbutton input").addEventListener("click", event => {
        console.log("refresh orders by user = " + selectedUser);
        getOrders(() => displayOrders());
        event.preventDefault();
    });
}

// suggested step 4, and needs get_orders
function displayOrders() {
    console.log("displayOrders");

    // remove class "active" from the order-area
    // if selectedUser is "none", just return--nothing to do
    // empty the ordertable, i.e., remove its content: we'll rebuild it
    // add class active to order-area
    // find the user_id of selectedUser via the users array
    // find the in-progress orders for the user by filtering array 
    // orders on user_id and status
    // if there are no orders for user, make ordermessage be "none yet"
    //  and remove active from element id'd order-info
    // Otherwise, add class active to element order-info, make
    //   ordermessage be "", and rebuild the order table 
    // Finally, if there are Baked orders here, make sure that
    // ackform is active, else not active
}

// suggested step 8: have order form hidden until needed
// Let user click on one of two tabs, show its related contents.
// Contents for both tabs are in the HTML after initial setup, 
// but one part is not displayed because of display:none in its CSS
// made effective via class "active".
// Note you need to remove the extra "active" in the originally provided
// HTML near the comment "active here to make everything show"
function setupTabs() {
    console.log("starting setupTabs");

    // Do this last. You may have a better approach, but here's one
    // way to do it. Also edit the html for better initial settings
    // of class active on these elements.    
    // Find an array of span elements for the tabs and another
    //  array of elements with class tabContent, the content for each tab.
    // Then tabSpan[0] is the first span and tabContent[0] is the
    // corresponding contents for that tab, and similarly with [1]s.
    // Then loop through the two cases i=0 and i=1:
    //   loop through tabSpan removing all class active's
    //   loop through tabContents removing all class active's
    //   set tabSpan[i]'s element active
    //   set tabContent[i]'s element active
}

// suggested step 5
function displaySizesToppingsOnOrderForm() {
    console.log("displaySizesToppingsOnOrderForm");
    // find the element with id order-sizes, and loop through sizes,
    // setting up <input> elements for radio buttons for each size
    // and labels for them too // and for each topping create an <input> element for a checkbox
    // and a <label> for each

}

// suggested step 6, and needs post_order
function setupOrderForm() {
    console.log("setupOrderForm...");

    // find the orderform's submitbutton and put an event listener on it
    // When the click event comes in, figure out the sizeName from
    // the radio button and the toppings from the checkboxes
    // Complain if these are not specified, using order-message
    // Else, figure out the user_id of the selectedUser, and
    // compose an order, and post it. On success, report the
    // new order number to the user using order-message

}

// Plain modern JS: use fetch, which returns a "promise"
// that we can combine with other promises and wait for all to finish
function getSizes() {
    let promise = fetch(
            baseUrl + "/sizes",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            //  Need the "return" keyword in the following--
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                sizes = json;
            })
            .catch(error => console.error('error in getSizes:', error));
    return promise;
}

function getToppings() {
    let promise = fetch(
            baseUrl + "/toppings",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                toppings = json;
            })
            .catch(error => console.error('error in getToppings:', error));
    return promise;
}

function getUsers() {

}

function getOrders() {

}
function updateOrder(order) {

}
function postOrder(order, onSuccess) {

}
function refreshData(thenFn) {
    // wait until all promises from fetches "resolve", i.e., finish fetching
    Promise.all([getSizes(), getToppings(), getUsers(), getOrders()]).then(thenFn);
}

console.log("starting...");
refreshData(main);
