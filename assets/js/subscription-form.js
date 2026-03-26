// Shared logic for subscription forms (email-updates and manage-preferences).
// Requires districts-by-state.js to be loaded first.
//
// Usage:
//   initSubscriptionForm({ stateSelect, districtInput, datalist, activityNote });

var highActivity = [
  'Arizona','California','Colorado','Florida','Georgia','Illinois','Maryland',
  'Massachusetts','Mississippi','Nevada','New Jersey','New York','North Carolina',
  'Oregon','Pennsylvania','Texas','Virginia','Washington'
];

var lowActivity = [
  'Alaska','Hawaii','Maine','Montana','North Dakota','South Dakota',
  'Vermont','West Virginia','Wyoming'
];

function initSubscriptionForm(els) {
  var stateSelect   = els.stateSelect;
  var districtInput = els.districtInput;
  var datalist      = els.datalist;
  var activityNote  = els.activityNote;

  stateSelect.addEventListener('change', function () {
    var s = this.value;

    if (!s) {
      activityNote.textContent = '';
      activityNote.classList.remove('visible');
      datalist.innerHTML = '';
      districtInput.placeholder = 'e.g. Los Angeles Unified School District';
      return;
    }

    var msg = '';
    if (highActivity.indexOf(s) !== -1) {
      msg = '⚡ ' + s + ' has high ICE enforcement activity and active campaigns. Local and state updates are especially valuable here.';
    } else if (lowActivity.indexOf(s) !== -1) {
      msg = s + ' has relatively limited ICE enforcement activity. National updates will keep you informed of broader trends.';
    } else {
      msg = 'Campaign activity in ' + s + ' varies by district. State and local updates will help you track what is happening near you.';
    }
    activityNote.textContent = msg;
    activityNote.classList.add('visible');

    datalist.innerHTML = '';
    var hasDistricts = (districtsByState[s] || []).length > 0;
    districtInput.placeholder = hasDistricts
      ? 'Start typing your district\u2026'
      : 'e.g. Los Angeles Unified School District';
  });

  districtInput.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    datalist.innerHTML = '';
    if (!q) return;
    var all = districtsByState[stateSelect.value] || [];
    all
      .filter(function (d) { return d.toLowerCase().indexOf(q) !== -1; })
      .slice(0, 4)
      .forEach(function (d) {
        var opt = document.createElement('option');
        opt.value = d;
        datalist.appendChild(opt);
      });
  });
}
