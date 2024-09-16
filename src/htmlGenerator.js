const routeAnalyzer = require("./routeAnalyzer");
const path = require("path");
const fs = require("fs");

const generateHTML = (app) => {
    const { tree } = routeAnalyzer(app);

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hierarchical Express Route Visualizer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .tree {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .root-container {
            border: 3px solid #3498db;
            border-radius: 10px;
            margin: 20px;
            padding: 20px;
            width: 200px;
            background-color: #ecf0f1;
        }
        .node {
            background-color: #fff;
            border: 2px solid #2ecc71;
            border-radius: 8px;
            margin: 10px;
            padding: 10px;
            text-align: center;
            transition: all 0.3s ease;
        }
        .node:hover {
            box-shadow: 0 0 15px rgba(46, 204, 113, 0.5);
        }
        .node-key {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .methods {
            font-size: 0.8em;
            color: #e67e22;
            margin-bottom: 3px;
        }
        .middlewares {
            font-size: 0.7em;
            color: #9b59b6;
        }
        .children {
            margin-left: 20px;
            border-left: 2px solid #3498db;
            padding-left: 20px;
        }

        .popup {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            justify-content: center; /* Centrer verticalement */
            align-items: center; /* Centrer horizontalement */
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 30px; /* Augmentation du padding pour un rendu plus espacé */
            border-radius: 10px; /* Coins arrondis */
            border: 1px solid #ccc;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Ombre douce pour un style professionnel */
            z-index: 1000;
            min-width: 300px;
            width: 40%;
            height: 50%;
        }
        
        .popup-overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6); /* Arrière-plan assombri */
            z-index: 999;
        }
        .close-btn {
            position: absolute; /* Placer en haut à droite */
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-size: 30px;
            color: #555;
            transition: color 0.3s; /* Animation douce du survol */
        }
        .close-btn:hover {
            color: #e74c3c; /* Changement de couleur au survol */
        }

        .info {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: large;
            font-weight: 500;
            color: #34495e;
        }
        .arrow {
            color: #2ecc71;
            font-size: larger;
        }
        .conten {
            height: 90%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center; /* Centrer horizontalement les éléments enfants */
            gap: 15px; /* Espacement entre les éléments */
            width: 100%;
        }

        p {
            margin: 10px 0;
            font-size: 18px;
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <h1>Hierarchical Express Route Visualizer</h1>
    <div id="tree" class="tree"></div>

    <script>
        var tree = ${JSON.stringify(tree)};

        function createNode(key, data) {
            var node = document.createElement('div');
            node.className = 'node';
            node.innerHTML = 
                '<div class="node-key">' + key + '</div>'

                node.addEventListener('click', function() {
                    showPopup(data);
                });
            return node;
        }

        function renderSubtree(key, data, container) {
            var node = createNode(key, data);
            container.appendChild(node);

            if (Object.keys(data.children).length > 0) {
                var childrenContainer = document.createElement('div');
                childrenContainer.className = 'children';
                for (var childKey in data.children) {
                    if (data.children.hasOwnProperty(childKey)) {
                        renderSubtree(childKey, data.children[childKey], childrenContainer);
                    }
                }
                container.appendChild(childrenContainer);
            }
        }

        function renderTree(tree) {
            var treeContainer = document.getElementById('tree');
            for (var key in tree) {
                if (tree.hasOwnProperty(key)) {
                    var rootContainer = document.createElement('div');
                    rootContainer.className = 'root-container';
                    renderSubtree(key, tree[key], rootContainer);
                    treeContainer.appendChild(rootContainer);
                }
            }
        }
        function showPopup(data) {
            var overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            overlay.style.display = 'block';
        
            var popup = document.createElement('div');
            popup.className = 'popup';
            popup.style.display = 'block';
        
            var closeButton = document.createElement('span');
            closeButton.textContent = '×';
            closeButton.className = 'close-btn';
            closeButton.onclick = function() {
                document.body.removeChild(popup);
                document.body.removeChild(overlay);
            };
        
            var content = document.createElement('div');
            content.className = 'conten';
            for (var i = 0; i < data.methods.length; i++) {
                var method = data.methods[i];
                var middleware = data.middlewares[i];
        
                var methodLine = document.createElement('p');
                methodLine.innerHTML += '<span class="info">Method: </span>' + method + (middleware ? "<span class='arrow'> => </span>" :"");
                methodLine.innerHTML += middleware ? '<span class="info">Middleware: </span>' + middleware:"";
                content.appendChild(methodLine);
            }
        
            popup.appendChild(closeButton);
            popup.appendChild(content);
            
        
            // Ajouter le popup et la superposition au document
            document.body.appendChild(overlay);
            document.body.appendChild(popup);
        }

        renderTree(tree);
    </script>
</body>
</html>
    `;

    saveHTMLToFile(html);
};

const saveHTMLToFile = (html) => {
    const projectDir = process.cwd();
    const dir = path.join(projectDir, 'generate');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFile(path.join(dir, 'hierarchical.html'), html, function (err) {
        if (err) throw err;
        console.log("File saved successfully in 'generate/hierarchical-route-visualizer.html'");
    });
};

module.exports = generateHTML;