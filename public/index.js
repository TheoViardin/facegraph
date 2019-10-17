function getNodes(users) {
    let alreadySet = []
    let nodes = []

    users.forEach(function(userDetail) {

        if (!alreadySet.includes(userDetail.id)) {
            alreadySet.push(userDetail.id)

            nodes.push({
                id: userDetail.id,
                label: userDetail.name,
                x: Math.random(),
                y: Math.random(),
                size: 1,
                color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
            })
        }
    })

    return nodes;
}

function getEdges(relations) {
    let alreadySet = []
    let edges = []

    let centerNodes = []
    relations.forEach(function(edgesDetail) {
        
        if (!alreadySet.includes(edgesDetail.id2 + '_' + edgesDetail.id1)) {
            alreadySet.push(edgesDetail.id2 + '_' + edgesDetail.id1)

            edges.push({
                id: edgesDetail.id2 + '_' + edgesDetail.id1,
                // Reference extremities:
                source: edgesDetail.id2,
                target: edgesDetail.id1,
                color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
                type: 'arrow'
            });

            centerNodes.push(edgesDetail.id1)
        }
    })

    return {edges: edges, centerNodes: centerNodes};
}

$(document).ready(function () {

    var s = new sigma('container');

    function render() {
        $.get('./graph', function (response) {
            console.log(response)
            
            $('#container').empty()

            s = new sigma({container: 'container', type: 'webgl', settings: {minEdgeSize: 30}});

            var nodes = getNodes(response.users);
            var edges = getEdges(response.edges)
            

            s.graph.read({
                nodes: nodes,
                edges: edges.edges
            })

            
            edges.centerNodes.map(function (idNode) {
                s.graph.nodes(idNode).size = 3
            })
            
            s.refresh()
            s.startForceAtlas2({
                barnesHutOptimize: true,
                slowDown: 10,
                worker: true,
                 gravity: 1,
                 outboundAttractionDistribution: true,
                 scalingRatio: 2
            })

            // TODO: ajouter un endpoint pour renvoyer les utilisateurs un par un et leur relation avec d'autres utilisateur qui on un id plus petit

            window.setTimeout(function() {s.killForceAtlas2()}, 200000);


            s.bind('clickNode', function (e) {            

                window.open(`https://twitter.com/${e.data.node.label}`)
            })
            
        })
    }

    $('form').on('submit', function (e) {
        e.preventDefault();
        $.post('./users', {'screen_name': $('#screen_name').val()}, function (response) {
            render()
        })
        
    })


    render()
        
  })