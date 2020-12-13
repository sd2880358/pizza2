"use strict";
// avoid warnings on using fetch and Promise --
/* global fetch, Promise */
// use port 80, i.e., apache server for webservice execution 
// Change localhost to localhost:8000 to use the tunnel to pe07's port 80
const baseUrl = "http://localhost/cs637/donghao/pizza2_server/api";
// globals representing state of data and UI
let selectedUser = 'none';
var selectedUserId;
let sizes = [];
let toppings = [];
let users = [];
let orders = [];
var day = 1;

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
    let sizeLabel = document.createElement("ul");
    for (var size of sizes){
        let li = document.createElement("li");
        li.className = "horizontal";
        li.append(size['size']);
        sizeLabel.appendChild(li);
    }
    document.querySelector("#sizes").append(sizeLabel);
    let toppingLabel = document.createElement("ul");
    for (var topping of toppings){
        let li = document.createElement("li");
        li.className = "horizontal";
        li.append(topping['topping']);
        toppingLabel.append(li);
    }
    document.querySelector('#toppings').append(toppingLabel);
}

// Suggested step 3: implement this, and get_users
function setupUserForm() {
    for (var user of users){
        let userLabel = document.createElement("option");
        userLabel.label = user['username'];
        userLabel.value = user['id'];
        document.querySelector("#userselect").append(userLabel);
    }
    const form = document.getElementById("userform")
    form.addEventListener("submit", event=> {
            selectedUserId = document.getElementById('userselect').value;
        for (var user of users){
            if (user['id'] == selectedUserId){
                selectedUser = user['username']
            }
        }
        document.getElementById('username-fillin1').innerHTML = selectedUser;
        document.getElementById('username-fillin2').innerHTML = selectedUser;
        document.getElementById("order-area").className = "active";
        displayOrders();
        event.preventDefault();
    });


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
        // bogus value for now
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
        getOrders(()=>displayOrders());
        event.preventDefault();
    });
}

// suggested step 4, and needs get_orders
function displayOrders() {
    console.log("displayOrders");
    document.getElementById("order-area").classList.remove("active");
    if (selectedUser !== "none") {
        const order_area = document.getElementById('order-area');
        order_area.className = "active";
        const order_by_user_id = orders.filter(order => order['user_id'] == selectedUserId);
        const prepared_orders = order_by_user_id.filter(order => order['status'] == "Preparing");
        const baked_orders = order_by_user_id.filter(order => order['status'] == "Baked")
        let Parent = document.getElementById("ordertable");
        if ((prepared_orders.length + baked_orders.length) == 0) {
            document.getElementById("order-info").classList.remove("active");
            document.getElementById('ordermessage').innerHTML = "none yet";
        } else {
            while (Parent.hasChildNodes()) {
                Parent.removeChild(Parent.firstChild);
            }
            let order_info = document.getElementById("order-info");
            order_info.className = "active";
            document.getElementById('ordermessage').innerHTML = "";
            let order_table = document.querySelector('#ordertable')
            let coloumn_1 = document.createElement("tr")
            let test = ["Order ID", "Size", "Toppings", "Status"]
            for (var t of test) {
                let th = document.createElement("th");
                th.innerHTML = t;
                coloumn_1.appendChild(th)
            }
            order_table.append(coloumn_1);
            for (var order of baked_orders) {
                let coloumn = document.createElement("tr");
                let td = document.createElement("td");
                let order_id = order['id'];
                let size = order['size'];
                let toppings = order['toppings'];
                const test = [order_id, size]
                for (var t of test) {
                    let td = document.createElement("td");
                    td.innerHTML = t;
                    coloumn.append(td);
                }
                for (var t of toppings) {
                    td.append(t)
                }
                coloumn.append(td);
                let newTd = document.createElement('td')
                newTd.innerHTML = order['status']
                coloumn.append(newTd);
                order_table.append(coloumn)
            }
            for (var order of prepared_orders) {
                let coloumn = document.createElement("tr");
                let td = document.createElement("td");
                let order_id = order['id'];
                let size = order['size'];
                let toppings = order['toppings'];
                const test = [order_id, size]
                for (var t of test) {
                    let td = document.createElement("td");
                    td.innerHTML = t;
                    coloumn.append(td);
                }
                for (var t of toppings) {
                    td.append(t)
                }
                coloumn.append(td);
                let newTd = document.createElement('td')
                newTd.innerHTML = order['status']
                coloumn.append(newTd);
                order_table.append(coloumn)
            }
            if (baked_orders.length > 0) {
                document.getElementById("ackform").className = 'active';
            }else{
                document.getElementById("ackform").classList.remove("active")
            }
        }
    }

}
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


// suggested step 8: have order form hidden until needed
// Let user click on one of two tabs, show its related contents.
// Contents for both tabs are in the HTML after initial setup, 
// but one part is not displayed because of display:none in its CSS
// made effective via class "active".
// Note you need to remove the extra "active" in the originally provided
// HTML near the comment "active here to make everything show"
function setupTabs() {
    console.log("starting setupTabs");
    let test1 = document.querySelectorAll("span")
    let test2 = document.querySelectorAll(".tabContent")
    for (var i = 0; i <= 2; i++) {
        test1.forEach(function (element) {
            element.classList.remove("active")
        })
        test2.forEach(function (element) {
            element.classList.remove("active")
        })
    }
    test1[0].addEventListener("click", event => {
        test1.forEach(function (element) {
            element.classList.remove("active")
        })
        test2.forEach(function (element) {
            element.classList.remove("active")
        })
        test1[0].className = "active"
        test2[0].className = "tabContent active"
        event.preventDefault();
    })
    test1[0].className = "active"
    test2[0].className = "tabContent active"
    test1[1].addEventListener("click", event => {
        if (selectedUser === "none") {
            alert("please selected a user")
        } else {
            test1.forEach(function (element) {
                element.classList.remove("active")
            })
            test2.forEach(function (element) {
                element.classList.remove("active")
            })
            test1[1].className = "active"
            test2[1].className = "tabContent active"
        }
        event.preventDefault();
    })
}
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


// suggested step 5
function displaySizesToppingsOnOrderForm() {
    console.log("displaySizesToppingsOnOrderForm");
    let order_sizes = document.getElementById("order-sizes");
    for (var size of sizes){
        let input = document.createElement("input");
        input.type = "radio";
        input.name = "size";
        input.id = "order-size"
        input.value = size['size'];
        let label = document.createElement("label");
        label.htmlFor = size['size'];
        label.innerHTML = size['size'];
        order_sizes.append(input);
        order_sizes.append(label);
    }
    let order_topping = document.getElementById('order-toppings')
    let ul = document.createElement('ul')
    for (var topping of toppings){
        let t = topping['topping']
        let input = document.createElement("input");
        input.type = "checkbox";
        input.name = "topping"
        input.value = t;
        input.id = "order-topping"
        let label = document.createElement("label");
        label.htmlFor = t;
        label.innerHTML = t;
        ul.append(input);
        ul.append(label);
    }
    order_topping.append(ul)
    // find the element with id order-sizes, and loop through sizes,
    // setting up <input> elements for radio buttons for each size
    // and labels for them too // and for each topping create an <input> element for a checkbox
    // and a <label> for each
}

// suggested step 6, and needs post_order
function setupOrderForm() {
    console.log("setupOrderForm...");
    let order_form = document.getElementById("orderform");
    order_form.addEventListener("submit", event=>{
        let selectedSize = []
        document.querySelectorAll('#order-size').forEach(function (element){
            if (element.checked){
                selectedSize = element.value;
            }
        })
        let selectedToppings = []
        document.querySelectorAll("#order-topping").forEach(function (element){
            if (element.checked){
                selectedToppings.push(element.value)
            }
        })
        if (selectedSize.length == 0 || selectedToppings.length == 0){
            document.getElementById("order-message").innerHTML = "Please Select a size and at least" +
                " one topping"
        }else {
            const order = {};
            order['user_id'] = selectedUserId.toString();
            order['size'] = selectedSize;
            order['day'] = day.toString();
            order['status'] = 'Preparing';
            order['toppings'] = selectedToppings;
            postOrder(order, function (element) {
                let order_message = document.getElementById("order-message");
                order_message.innerHTML = "Your pizza orderID is " + element.id;
                orders.push(element)
                displayOrders();
            });
        }
        event.preventDefault();
    }
    )
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
    let promise = fetch(
        baseUrl + "/users",
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
            users = json;
        })
        .catch(error => console.error('error in getUsers:', error));
    return promise;
}

function getOrders(fn) {
    let promise = fetch(
        baseUrl + "/orders",
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
            orders = json;
        })
        .then(fn)
        .catch(error => console.error('error in getOrders:', error));
    return promise
}
function getDay(){
    let promise = fetch(
        baseUrl + "/day",
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
            day = json;
        })
        .catch(error => console.error('error in getUsers:', error));
    return promise;
}
function updateOrder(order) {
    let id = order['id']
    let promise = fetch(
        baseUrl + "/orders/"+id,
        {method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)}
    )
        .then(// fetch sucessfully sent the request...
            response => {
                if (response.ok) { // check for HTTP 200 responsee
                } else {  // throw to .catch below
                    throw Error('HTTP' + response.status + ' ' +
                        response.statusText);
                }
            })
        .catch(error => console.error('error in put order', error));
    return promise;
}


function postOrder(order, onSuccess) {
    let promise = fetch(
        baseUrl + "/orders",
        {method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)}
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
            return json
        })
        .then(order => {
            onSuccess(order);
        })
        .catch(error => console.error('error in postOrder', error));
    return promise
}
function refreshData(thenFn) {
    // wait until all promises from fetches "resolve", i.e., finish fetching
    Promise.all([getSizes(), getToppings(), getUsers(), getOrders(), getDay()]).then(thenFn);
}

console.log("starting...");
refreshData(main);
