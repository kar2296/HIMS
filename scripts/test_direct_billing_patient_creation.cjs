const fs = require('fs');
const assert = require('assert');

console.log('--- Testing Direct Billing Implementation & Service Lock ---');

// 1. Check directbillinglist.html
const directHtml = fs.readFileSync('public/views/billing/directbilling/directbillinglist.html', 'utf8');

// Ensure directbillinglist.html mounts OpBillingListScreen in React
assert(directHtml.includes('name="OpBillingListScreen"'), 'directHtml must mount OpBillingListScreen');
assert(directHtml.includes('reactProps: reactProps'), 'directHtml must pass reactProps');

console.log('✓ directbillinglist.html: Migrated to React OpBillingListScreen');

// 2. Check directbillinglist.js
const directJs = fs.readFileSync('public/views/billing/directbilling/directbillinglist.js', 'utf8');

// Ensure isBillGenerated helper exists
assert(directJs.includes('$scope.isBillGenerated = function ()'), 'directJs must include isBillGenerated helper');
assert(directJs.includes('registration/patient/AddPatient'), 'directJs must handle AddPatient on the fly');

// Ensure service edits/adds are guarded
assert(directJs.includes('if ($scope.isBillGenerated && $scope.isBillGenerated())'), 'directJs must guard addNewLineItem and other actions with isBillGenerated()');

console.log('✓ directbillinglist.js: Passed all assertions');

// 3. Check OpBillingListScreen.tsx
const opTsx = fs.readFileSync('src/react-components/OpBillingListScreen.tsx', 'utf8');

// Ensure isDG conditional rendering of direct patient details
assert(opTsx.includes('isDG ? ('), 'OpBillingListScreen must conditionally render for isDG');
assert(opTsx.includes('Walk-In / Direct Patient Details'), 'OpBillingListScreen must render Walk-In Direct Patient Details');
assert(opTsx.includes('txtDirectPatientName'), 'OpBillingListScreen must include txtDirectPatientName');
assert(opTsx.includes('selDirectPatientGender'), 'OpBillingListScreen must include selDirectPatientGender');
assert(opTsx.includes('txtDirectPatientAge'), 'OpBillingListScreen must include txtDirectPatientAge');
assert(opTsx.includes('txtDirectPatientMobile'), 'OpBillingListScreen must include txtDirectPatientMobile');
assert(opTsx.includes('selDirectPatientReferral'), 'OpBillingListScreen must include selDirectPatientReferral');

// Ensure patient search is skipped when isDG
assert(opTsx.includes('if (isDG) {'), 'OpBillingListScreen must skip patient search when isDG is true');

// Ensure service edit & add disabled when generated
assert(opTsx.includes('isCurrentBillGenerated && ['), 'OpBillingListScreen must block service edits and additions when bill is generated');

console.log('✓ OpBillingListScreen.tsx: Passed all assertions');

// 4. Check opbilling-list.js
const opJs = fs.readFileSync('public/views/billing/opbilling/opbilling-list.js', 'utf8');
assert(opJs.includes("if (vm.Context == 'DG' && (!$scope.item.PatientId || $scope.item.PatientId <= 0))"), 'opJs must handle DG direct patient creation');
assert(opJs.includes("case 'directPatientUpdate':"), 'opJs must handle directPatientUpdate react action');

console.log('✓ opbilling-list.js: Passed all assertions');

console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
