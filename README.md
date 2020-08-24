# 💵 GoDutch-Server 💵
Your first-choice app for ***going dutch***

This project is for the 2nd week of *KAIST CS496 Immersion Camp: Intensive Programming and Startup*, the base requirements of the project being **developing an android application using a backend server**. Check out the client application [here](https://github.com/GoDutchCS496/GoDutch)

*Warning*: the paths to endpoints and the inner implementations were done in an extremely hasty manner. So please bear with the inconsistencies!
Below is a list of endpoints that a user can send requests to:

### Authentication `/auth`
* *POST* `/auth/login`: retrieve informations(id, email, first and last name) of a user that are stored in Facebook's database
    required fields:
    * `access_token`: the access token received from Facebook in the client side
    returns (JSON):
    * `member`: whether or not this user is already logged into GoDutch
    * `id`: identification number of user stored in Facebook
    * `email`: email of user stored in Facebook (empty string if it doesn't exist)
    * `first_name`: first name of user stored in Facebook
    * `last_name`: last name of user stored in Facebook
* *POST* `/auth/register`: register a new user to GoDutch
    * required fields: JSON object. Check out the schema in `models/User.js` for reference.

### Contacts `/api/contacts`
* *POST* `/api/contacts/insert`: add a list of contacts for a specific user
    required fields:
    * `id`: the identification string from facebook's access token
    * `contacts`: an array of `{ name: String, number: String, email: String }` objects, each of which represent a single contact
    returns:
    * `{ success: true }` if successful
    * error message with status `500` otherwise

### Images `/api/images`
* *GET* `/api/images/list/:id`: get a list of paths to a user's gallery
    params:
    * `id`: identification string of user
    returns:
    * the images are stored under the path `/tmp/uploads/<user-id>/<photo-name>`. the server will return a list of paths without the first `/tmp` part
* *POST* `/api/images/upload`: upload a list of photos to the user's gallery
    required fields:
    * `id`: identification string of user
    * The client must send a request of content type `multipart/form-data` under the name `photos` to send their photos
    returns:
    * `{ success: true }` if successful
    * error message with status `500` otherwise
* *POST* `/api/images/delete`: delete a specified list of images from the user's gallery
    required fields:
    * `id`: identification string of user
    * `photos`: path to the photo, following the same format to that of GET `api/images/list/:id`
    returns:
    * `{ success: true, photos: <paths_to_photos> }` if successful
    * error message with status `500` otherwise

### Parties `/api/parties`
* *GET* `/api/parties/list/:id`: retrieve a list of parties that a specific user is included in
    params:
    * `id`: identification string of user
    returns:
    * array of objects that the specified user is included in
* *GET* `/api/parties/transactions/:id`: retrieve all transactions in a specific party, grouped and sorted by transaction date
    params:
    * `id`: identification string of user
    returns:
    * a complex list of objects, each of which represent transactions added on a specific day. refer to code for more detail
    * error message with status `500` if unsuccessful
* *GET* `/api/parties/single/:id`: retrieve members included in a specific party
    params:
    * `id`: identification string of party
    returns (JSON):
    * `members`: members of the party
    * `namesMap`: JS object containing <user-id> -> <user-name> key-value mappings
* *GET* `/api/parties/:id/resolve`: resolve all transactions of a specific party and return who should send money to whom
    params:
    * `id`: identification string of party
    returns (JSON):
    * `result`: JS object containing money transfer details. refer to implementation for further detail
    * `namesMap`: JS object containing <user-id> -> <user-name> key-value mappings
* *POST* `/api/parties/add`: add a new party
    required fields:
    * `id`: desired name of the party
    * `members`: an array of `id`s of the members of the party to be created
    returns:
    * `{ success: true }` if successful
    * error message with status `500` otherwise
* *POST* `/api/parties/transactions/complete`: mark transactions between two users as completed
    required fields:
    * `party_id`: identification string of party that the transaction is included in
    * `user_id`: identification string of user that sends the money
    * `to`: identification string of user that receives the money
    returns:
    * `{ successful: true }` if successful
    * error message with status `500` if unsuccessful
* *POST* `/api/parties/:id/transactions/add`: add a new transaction to a specific party
    params:
    * `id`: identification string of party
    returns:
    * `{ successful: true }` if successful
    * error message with status `500` otherwise

### Users `/api/users`
* *GET* `/api/users/list/:id`: retrieve the information of people that are members of GoDutch among the contacts of user with `id`
    params:
    * `id`: identification string of user
    returns:
    * `result`: the information of people that are members of GoDutch among the contacts of user `id`
* *GET* `/api/users/single/:id`: retrieve the information of a specific user
    params:
    * `id`: identification string of user
    returns:
    * `result`: information of user. refer to `models/User.js` schema for further detail
* *GET* `/api/users/multiple`: retrieve informations of multiple users
    queries:
    * `users`: array of user ids
    returns:
    * `result`: array of informations of users. refer to `models/User.js` schema for further detail
* *GET* `/api/users/peopleiowe/:id`: retrieve an array of people a specific users owes money to
    params:
    * `id`: identification string of user
    returns (JSON):
    * `result`: an array of people a specific users owes money to
    * `namesMap`: JS object containing <user-id> -> <user-name> key-value mappings
