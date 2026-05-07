const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    const files = execSync('grep -rl "<richtexteditor" ./public/views/').toString().trim().split('\n');

    files.forEach(htmlFile => {
        if (!htmlFile) return;
        
        let htmlContent = fs.readFileSync(htmlFile, 'utf8');
        const jsFile = htmlFile.replace('.html', '.js');
        
        // Find self-closing and normal richtexteditor tags
        const regex = /<richtexteditor([^>]*)>(.*?)<\/richtexteditor>|<richtexteditor([^>]*)\/>/gs;
        const matches = [...htmlContent.matchAll(regex)];
        
        if (matches.length === 0) return;
        
        let modelPaths = [];
        let hasInsertHtml = false;
        let insertHtmlVars = [];
        
        htmlContent = htmlContent.replace(regex, (match, attrs1, content, attrs2) => {
            const attrs = attrs1 || attrs2 || '';
            const getAttr = (name) => {
                const m = attrs.match(new RegExp(`${name}="([^"]+)"`));
                return m ? m[1] : null;
            };
            
            const richtext = getAttr('richtext');
            const disabled = getAttr('ng-disabled');
            const inserthtml = getAttr('inserthtml');
            const height = getAttr('height');
            
            if (richtext) modelPaths.push(richtext);
            if (inserthtml) {
                hasInsertHtml = true;
                if (!insertHtmlVars.includes(inserthtml)) insertHtmlVars.push(inserthtml);
            }
            
            let props = `{ richtext: ${richtext}, onContentChange: onRteChange`;
            if (disabled) props += `, readonly: ${disabled}`;
            if (inserthtml) props += `, insertHtml: ${inserthtml}, onInsertHtmlDone: onInsertHtmlDone`;
            if (height) props += `, height: '${height}'`;
            else props += `, height: 420`;
            props += ` }`;
            
            return `<react-component name="RichTextEditor" props="${props}"></react-component>`;
        });
        
        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`Updated HTML: ${htmlFile}`);
        
        if (fs.existsSync(jsFile) && modelPaths.length > 0) {
            let jsContent = fs.readFileSync(jsFile, 'utf8');
            const uniqueModels = [...new Set(modelPaths)];
            
            if (!jsContent.includes('$scope.onRteChange')) {
                // If there are multiple unique models in the same file (rare), we'd need multiple handlers.
                // But most have just one. If there's one, we use it. If multiple, we just map the first one and warn.
                const modelPath = uniqueModels[0];
                if (uniqueModels.length > 1) {
                    console.warn(`WARNING: Multiple unique models found in ${htmlFile}. Script only binds to the first: ${modelPath}`);
                }
                
                const injection = `
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "${modelPath}".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };
${hasInsertHtml ? `
        $scope.onInsertHtmlDone = function() {
            $scope.$evalAsync(function() {
                ${insertHtmlVars.map(v => `$scope.${v} = '';`).join('\n                ')}
            });
        };
` : ''}`;

                // Try to inject right after the controller function signature
                const fnStartMatch = jsContent.match(/function\s+\w+(?:Controller)?\s*\([^\)]*\)\s*\{/);
                if (fnStartMatch) {
                    const insertPos = fnStartMatch.index + fnStartMatch[0].length;
                    jsContent = jsContent.slice(0, insertPos) + injection + jsContent.slice(insertPos);
                    fs.writeFileSync(jsFile, jsContent);
                    console.log(`Injected JS:  ${jsFile}`);
                } else {
                    console.warn(`COULD NOT INJECT JS: ${jsFile}`);
                }
            }
        }
    });
    console.log("Migration script complete.");
} catch (e) {
    console.error("Error running script:", e);
}
