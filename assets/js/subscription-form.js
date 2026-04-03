// Shared logic for subscription forms (email-updates and manage-preferences).
// Requires districts-by-state.js to be loaded first.
//
// Usage:
//   initSubscriptionForm({ stateSelect, districtInput, datalist, activityNote });

var statePages = {
  'Alabama': '/states/al.html', 'Alaska': '/states/ak.html', 'Arizona': '/states/az.html',
  'Arkansas': '/states/ar.html', 'California': '/states/ca.html', 'Colorado': '/states/co.html',
  'Connecticut': '/states/ct.html', 'Delaware': '/states/de.html', 'Florida': '/states/fl.html',
  'Georgia': '/states/ga.html', 'Hawaii': '/states/hi.html', 'Idaho': '/states/id.html',
  'Illinois': '/states/il.html', 'Indiana': '/states/in.html', 'Iowa': '/states/ia.html',
  'Kansas': '/states/ks.html', 'Kentucky': '/states/ky.html', 'Louisiana': '/states/la.html',
  'Maine': '/states/me.html', 'Maryland': '/states/md.html', 'Massachusetts': '/states/ma.html',
  'Michigan': '/states/mi.html', 'Minnesota': '/states/mn.html', 'Mississippi': '/states/ms.html',
  'Missouri': '/states/mo.html', 'Montana': '/states/mt.html', 'Nebraska': '/states/ne.html',
  'Nevada': '/states/nv.html', 'New Hampshire': '/states/nh.html', 'New Jersey': '/states/nj.html',
  'New Mexico': '/states/nm.html', 'New York': '/states/ny.html', 'North Carolina': '/states/nc.html',
  'North Dakota': '/states/nd.html', 'Ohio': '/states/oh.html', 'Oklahoma': '/states/ok.html',
  'Oregon': '/states/or.html', 'Pennsylvania': '/states/pa.html', 'Rhode Island': '/states/ri.html',
  'South Carolina': '/states/sc.html', 'South Dakota': '/states/sd.html', 'Tennessee': '/states/tn.html',
  'Texas': '/states/tx.html', 'Utah': '/states/ut/', 'Vermont': '/states/vt.html',
  'Virginia': '/states/va.html', 'Washington': '/states/wa.html', 'West Virginia': '/states/wv.html',
  'Wisconsin': '/states/wi.html', 'Wyoming': '/states/wy.html'
};

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
      activityNote.innerHTML = '';
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
    var page = statePages[s];
    if (page) {
      msg += ' <a href="' + page + '">View the ' + s + ' page →</a>';
    }
    activityNote.innerHTML = msg;
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
