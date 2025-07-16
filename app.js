let groupCount = 0;

function addGroup() {
  const div = document.createElement('div');
  div.className = 'group-entry';
  div.innerHTML = `
    <label>グループ名:</label>
    <input type="text" class="group-name" /><br />
    <label>メンバー（最大7人）:</label>
    <div class="members">
      ${[...Array(7)].map(() => '<input type="text" class="member" placeholder="名前" />').join('')}
    </div>
    <label>出演不可能順番（例: 1,3,5）:</label>
    <input type="text" class="unavailable" placeholder="例: 1,3,5" />
  `;
  document.getElementById('groups').appendChild(div);
  groupCount++;
}

function getTimeString(start, slot, duration) {
  const [h, m] = start.split(':').map(Number);
  const totalMinutes = h * 60 + m + (slot - 1) * duration;
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const mm = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function generateSchedule() {
  const interval = parseInt(document.getElementById('interval').value);
  const startTime = document.getElementById('startTime').value;
  const slotDuration = parseInt(document.getElementById('slotDuration').value);

  const groups = [...document.querySelectorAll('.group-entry')].map(entry => {
    return {
      name: entry.querySelector('.group-name').value,
      members: [...entry.querySelectorAll('.member')].map(i => i.value.trim()).filter(v => v),
      unavailable: (entry.querySelector('.unavailable').value || '')
        .split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)),
    };
  });

  const schedule = [];
  const memberLastSlot = {};
  const used = new Set();
  let slot = 1;

  while (schedule.length < groups.length) {
    let added = false;
    for (let i = 0; i < groups.length; i++) {
      if (used.has(i)) continue;
      const group = groups[i];
      if (group.unavailable.includes(slot)) continue;

      const canPerform = group.members.every(member => {
        return !(member in memberLastSlot) || slot - memberLastSlot[member] >= interval;
      });

      if (canPerform) {
        schedule.push({ slot, ...group });
        group.members.forEach(member => memberLastSlot[member] = slot);
        used.add(i);
        added = true;
        break;
      }
    }
    if (!added && schedule.length < groups.length) {
      schedule.push({ slot, name: '（空き）', members: [] });
    }
    slot++;
  }

  const tbody = document.querySelector('#schedule tbody');
  tbody.innerHTML = '';
  schedule.forEach(row => {
    const timeStr = getTimeString(startTime, row.slot, slotDuration);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${timeStr}</td>
      <td>${row.name}</td>
      <td>${row.members.map(m => `<span class="member-box">${m}</span>`).join(' ')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function recalculateTimes() {
  const startTime = document.getElementById('startTime').value;
  const slotDuration = parseInt(document.getElementById('slotDuration').value);
  const rows = document.querySelectorAll('#schedule tbody tr');

  rows.forEach((tr, i) => {
    const slot = i + 1;
    const timeStr = getTimeString(startTime, slot, slotDuration);
    tr.children[0].textContent = timeStr;
  });
}

function resetAll() {
  document.getElementById('groups').innerHTML = '';
  document.querySelector('#schedule tbody').innerHTML = '';
  document.getElementById('interval').value = 2;
  document.getElementById('startTime').value = '13:00';
  document.getElementById('slotDuration').value = 10;
  groupCount = 0;
}
