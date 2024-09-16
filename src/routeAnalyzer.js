const routeAnalyzer = (app) => {
    const routeTree = {};

    const addRouteToTree = (tree, route, methods, middlewares) => {
        const segments = route.split('/').filter(Boolean);
        let currentNode = tree;

        segments.forEach((segment, index) => {
            
            if (!currentNode[segment]) {
                currentNode[segment] = {
                    methods: [],
                    middlewares: [],
                    children: {}
                };
            }
            
            if (index === segments.length - 1) {
                currentNode[segment].methods.push(...methods);
                currentNode[segment].middlewares.push(...middlewares);
            }

            currentNode = currentNode[segment].children;
        });
    };


    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            const path = middleware.route.path;
            const methods = Object.keys(middleware.route.methods);
            const middlewares = middleware.route.stack.map(layer => layer.name).filter(name => name !== '<anonymous>');


            addRouteToTree(routeTree, path, methods, middlewares);
        }
    });

    return {
        tree: routeTree
    };
};

module.exports = routeAnalyzer;
