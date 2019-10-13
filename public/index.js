$(document).ready(function () {

    var s = new sigma('container');

    function render() {
        $.get('./graph', function (response) {
            console.log(response)
            
            $('#container').empty()

            s = new sigma('container');

            var users = []
            var user_user = []

            response.user.forEach(function (userArray) { 
                userArray.forEach(function(userDetail) {  
                    console.log(userDetail.data.id)
                    if (!users.includes(userDetail.data.id)) {
                        users.push(userDetail.data.id)
                        s.graph.addNode({
                            id: userDetail.data.id,
                            label: userDetail.data.name,
                            x: Math.random(),
                            y: Math.random(),
                            size: 1
                        })
                    }
                })
            })

            response.user_user.forEach(function (user_userArray) {
                user_userArray.forEach(function(user_userDetail) {
                    console.log(user_userDetail)
                    if (!user_user.includes(user_userDetail.data.user1 + '_' + user_userDetail.data.user2)) {
                        user_user.push(user_userDetail.data.user1 + '_' + user_userDetail.data.user2)
                        s.graph.addEdge({
                            id: user_userDetail.data.user1 + '_' + user_userDetail.data.user2,
                            // Reference extremities:
                            source: user_userDetail.data.user1,
                            target: user_userDetail.data.user2,
                            color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
                        });
                    }
                })
            })
            
            s.refresh()
            s.startForceAtlas2({
                linLogMode: true
            })

            window.setTimeout(function() {s.killForceAtlas2()}, 2000);


            s.bind('clickNode', function (e) {            

                window.open(`https://twitter.com/${e.data.node.label}`)
            })
            
        })
    }

    $('form').on('submit', function (e) {
        e.preventDefault();
        $.post('./user', {'screen_name': $('#screen_name').val()}, function (response) {
            render()
        })
        
    })


    render()
        
  })