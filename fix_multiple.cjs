const fs = require('fs');

// Fix 1: antibiotic-culture
let htmlFile = './public/views/lis/antibioticculture/antibiotic-culture.html';
let jsFile = './public/views/lis/antibioticculture/antibiotic-culture.js';

let html = fs.readFileSync(htmlFile, 'utf8');
html = html.replace('onContentChange: onRteChange', 'onContentChange: onGramStainChange');
html = html.replace('onContentChange: onRteChange', 'onContentChange: onRemarksChange');
fs.writeFileSync(htmlFile, html);

let js = fs.readFileSync(jsFile, 'utf8');
js = js.replace(/\$scope\.onRteChange = function\(html\) \{[\s\S]*?\}\;\n/m, `
        $scope.onGramStainChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.GramStain = html;
            });
        };
        $scope.onRemarksChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.Remarks = html;
            });
        };
`);
fs.writeFileSync(jsFile, js);
console.log("Fixed antibiotic-culture");

// Fix 2: testtemplatemasters
htmlFile = './public/views/lis/testmaster/testtemplatemasters.html';
jsFile = './public/views/lis/testmaster/testtemplatemasters.js';

html = fs.readFileSync(htmlFile, 'utf8');
html = html.replace('onContentChange: onRteChange', 'onContentChange: onMaleDataChange');
html = html.replace('onContentChange: onRteChange', 'onContentChange: onFemaleDataChange');
html = html.replace('onContentChange: onRteChange', 'onContentChange: onChildDataChange');
fs.writeFileSync(htmlFile, html);

js = fs.readFileSync(jsFile, 'utf8');
js = js.replace(/\$scope\.onRteChange = function\(html\) \{[\s\S]*?\}\;\n/m, `
        $scope.onMaleDataChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.MaleDataTemplate = html;
            });
        };
        $scope.onFemaleDataChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.FemaleDataTemplate = html;
            });
        };
        $scope.onChildDataChange = function(html) {
            $scope.$evalAsync(function() {
                if ($scope.item) $scope.item.ChildDataTemplate = html;
            });
        };
`);
fs.writeFileSync(jsFile, js);
console.log("Fixed testtemplatemasters");
