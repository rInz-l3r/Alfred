// fetching active users
function getUsers(client) {
    userList = []
    userListRaw = []
    for (user of client.users.cache.keys()) {
        userListRaw.push(client.users.cache.get(user));
    };

    for (user of userListRaw) {
        if (user.bot != true) {
            userList.push(user.id)
        };
    };
    return userList
};

module.exports = {getUsers}