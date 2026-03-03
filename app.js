/* ============================================
   GymTracker — Main Application Logic
   ============================================ */

// ——— Exercise Catalog ———
const EXERCISE_CATALOG = [
    // Pecho
    { id: 'bench_press', name: 'Press de banca', muscle: 'Pecho' },
    { id: 'incline_bench', name: 'Press inclinado', muscle: 'Pecho' },
    { id: 'decline_bench', name: 'Press declinado', muscle: 'Pecho' },
    { id: 'chest_fly', name: 'Aperturas con mancuernas', muscle: 'Pecho' },
    { id: 'cable_crossover', name: 'Cruces en polea', muscle: 'Pecho' },
    { id: 'push_ups', name: 'Flexiones', muscle: 'Pecho' },
    { id: 'dips_chest', name: 'Fondos (pecho)', muscle: 'Pecho' },
    // Espalda
    { id: 'pull_ups', name: 'Dominadas', muscle: 'Espalda' },
    { id: 'lat_pulldown', name: 'Jalón al pecho', muscle: 'Espalda' },
    { id: 'barbell_row', name: 'Remo con barra', muscle: 'Espalda' },
    { id: 'dumbbell_row', name: 'Remo con mancuerna', muscle: 'Espalda' },
    { id: 'cable_row', name: 'Remo en polea', muscle: 'Espalda' },
    { id: 'deadlift', name: 'Peso muerto', muscle: 'Espalda' },
    { id: 'face_pulls', name: 'Face pulls', muscle: 'Espalda' },
    // Hombros
    { id: 'overhead_press', name: 'Press militar', muscle: 'Hombros' },
    { id: 'lateral_raise', name: 'Elevaciones laterales', muscle: 'Hombros' },
    { id: 'front_raise', name: 'Elevaciones frontales', muscle: 'Hombros' },
    { id: 'reverse_fly', name: 'Pájaros', muscle: 'Hombros' },
    { id: 'arnold_press', name: 'Press Arnold', muscle: 'Hombros' },
    { id: 'shrugs', name: 'Encogimientos', muscle: 'Hombros' },
    // Bíceps
    { id: 'barbell_curl', name: 'Curl con barra', muscle: 'Bíceps' },
    { id: 'dumbbell_curl', name: 'Curl con mancuernas', muscle: 'Bíceps' },
    { id: 'hammer_curl', name: 'Curl martillo', muscle: 'Bíceps' },
    { id: 'preacher_curl', name: 'Curl en banco Scott', muscle: 'Bíceps' },
    { id: 'cable_curl', name: 'Curl en polea', muscle: 'Bíceps' },
    // Tríceps
    { id: 'tricep_pushdown', name: 'Extensión en polea', muscle: 'Tríceps' },
    { id: 'skull_crushers', name: 'Press francés', muscle: 'Tríceps' },
    { id: 'overhead_tricep', name: 'Extensión sobre cabeza', muscle: 'Tríceps' },
    { id: 'dips_tricep', name: 'Fondos (tríceps)', muscle: 'Tríceps' },
    { id: 'close_grip_bench', name: 'Press banca agarre cerrado', muscle: 'Tríceps' },
    // Piernas
    { id: 'squat', name: 'Sentadilla', muscle: 'Piernas' },
    { id: 'leg_press', name: 'Prensa de piernas', muscle: 'Piernas' },
    { id: 'lunges', name: 'Zancadas', muscle: 'Piernas' },
    { id: 'leg_extension', name: 'Extensión de cuádriceps', muscle: 'Piernas' },
    { id: 'leg_curl', name: 'Curl femoral', muscle: 'Piernas' },
    { id: 'calf_raise', name: 'Elevación de gemelos', muscle: 'Piernas' },
    { id: 'hip_thrust', name: 'Hip thrust', muscle: 'Piernas' },
    { id: 'bulgarian_split', name: 'Sentadilla búlgara', muscle: 'Piernas' },
    { id: 'rdl', name: 'Peso muerto rumano', muscle: 'Piernas' },
    // Core
    { id: 'plank', name: 'Plancha', muscle: 'Core' },
    { id: 'crunches', name: 'Abdominales', muscle: 'Core' },
    { id: 'leg_raise', name: 'Elevación de piernas', muscle: 'Core' },
    { id: 'russian_twist', name: 'Giro ruso', muscle: 'Core' },
    { id: 'cable_woodchop', name: 'Leñador en polea', muscle: 'Core' },
    { id: 'ab_wheel', name: 'Rueda abdominal', muscle: 'Core' },
];

// ——— App State ———
class GymTrackerApp {
    constructor() {
        this.currentView = 'routines';
        this.routines = this.load('gymtracker_routines') || [];
        this.history = this.load('gymtracker_history') || [];
        this.editingRoutineId = null;
        this.selectedExercises = [];
        this.tempPickerSelection = [];

        // Active workout state
        this.activeWorkout = null;
        this.workoutStartTime = null;
        this.workoutTimerInterval = null;

        // Rest timer state
        this.restTime = 90;
        this.restRemaining = 90;
        this.restTimerInterval = null;
        this.restTimerRunning = false;

        // Progress state
        this.currentProgressMetric = 'weight'; // 'weight' or 'volume'

        // Confirm callback
        this._confirmCallback = null;

        this.init();
    }

    // ——— Initialization ———
    init() {
        this.renderRoutines();
        this.renderTrainSelect();
        this.renderHistory();
        this.renderProgressSelect();
        this.updateEmptyStates();

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => { });
        }
    }

    // ——— Persistence ———
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Storage full');
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    // ——— Navigation ———
    navigate(viewName) {
        // If in active workout and navigating away from train, confirm
        if (this.currentView === 'train' && this.activeWorkout && viewName !== 'train') {
            // Allow navigation but keep workout running
        }

        this.currentView = viewName;
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        const mainViews = { routines: 'view-routines', train: 'view-train', progress: 'view-progress', history: 'view-history' };
        const targetEl = document.getElementById(mainViews[viewName]);
        if (targetEl) {
            targetEl.classList.add('active');
        }

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Update header
        const titles = { routines: 'Mis Rutinas', train: 'Entrenar', progress: 'Progreso', history: 'Historial' };
        document.getElementById('header-title').textContent = titles[viewName] || 'GymTracker';

        // Update header action button
        const actionBtn = document.getElementById('header-action-btn');
        if (viewName === 'routines') {
            actionBtn.classList.remove('hidden');
            actionBtn.onclick = () => this.showCreateRoutine();
        } else {
            actionBtn.classList.add('hidden');
        }

        // Re-render relevant views
        if (viewName === 'train') this.renderTrainSelect();
        if (viewName === 'history') this.renderHistory();
        if (viewName === 'routines') this.renderRoutines();
        if (viewName === 'progress') this.renderProgressChart();

        this.updateEmptyStates();
    }

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const el = document.getElementById(viewId);
        if (el) el.classList.add('active');
    }

    // ——— Routine CRUD ———
    showCreateRoutine() {
        this.editingRoutineId = null;
        this.selectedExercises = [];
        document.getElementById('routine-name').value = '';
        this.renderRoutineExercises();
        this.showView('view-edit-routine');
        document.getElementById('header-title').textContent = 'Nueva Rutina';
        document.getElementById('header-action-btn').classList.add('hidden');
    }

    showEditRoutine(id) {
        const routine = this.routines.find(r => r.id === id);
        if (!routine) return;
        this.editingRoutineId = id;
        this.selectedExercises = [...routine.exercises];
        document.getElementById('routine-name').value = routine.name;
        this.renderRoutineExercises();
        this.showView('view-edit-routine');
        document.getElementById('header-title').textContent = 'Editar Rutina';
        document.getElementById('header-action-btn').classList.add('hidden');
    }

    cancelEditRoutine() {
        this.navigate('routines');
    }

    saveRoutine() {
        const name = document.getElementById('routine-name').value.trim();
        if (!name) {
            this.showToast('Escribe un nombre para la rutina');
            return;
        }
        if (this.selectedExercises.length === 0) {
            this.showToast('Añade al menos un ejercicio');
            return;
        }

        if (this.editingRoutineId) {
            const idx = this.routines.findIndex(r => r.id === this.editingRoutineId);
            if (idx !== -1) {
                this.routines[idx].name = name;
                this.routines[idx].exercises = [...this.selectedExercises];
            }
        } else {
            this.routines.push({
                id: this.uid(),
                name,
                exercises: [...this.selectedExercises],
                createdAt: Date.now()
            });
        }

        this.save('gymtracker_routines', this.routines);
        this.showToast(this.editingRoutineId ? 'Rutina actualizada' : 'Rutina creada ✓');
        this.navigate('routines');
    }

    deleteRoutine(id) {
        this.showConfirm('¿Eliminar esta rutina?', () => {
            this.routines = this.routines.filter(r => r.id !== id);
            this.save('gymtracker_routines', this.routines);
            this.renderRoutines();
            this.updateEmptyStates();
            this.showToast('Rutina eliminada');
        });
    }

    renderRoutines() {
        const container = document.getElementById('routines-list');
        if (!this.routines.length) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = this.routines.map(r => {
            const exNames = r.exercises.map(e => {
                const cat = EXERCISE_CATALOG.find(c => c.id === e);
                return cat ? cat.name : e;
            });
            const subtitle = exNames.length > 3
                ? exNames.slice(0, 3).join(', ') + ` +${exNames.length - 3} más`
                : exNames.join(', ');
            return `
                <div class="glass-card routine-card" id="routine-${r.id}">
                    <div class="card-title">${this.esc(r.name)}</div>
                    <div class="card-subtitle">${this.esc(subtitle)}</div>
                    <div class="card-actions">
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); app.showEditRoutine('${r.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); app.deleteRoutine('${r.id}')" style="color: var(--danger);">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderRoutineExercises() {
        const container = document.getElementById('routine-exercises-list');
        if (!this.selectedExercises.length) {
            container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Sin ejercicios seleccionados</span>';
            return;
        }
        container.innerHTML = this.selectedExercises.map(exId => {
            const cat = EXERCISE_CATALOG.find(c => c.id === exId);
            const name = cat ? cat.name : exId;
            return `
                <div class="exercise-chip">
                    ${this.esc(name)}
                    <button onclick="app.removeExerciseFromRoutine('${exId}')" aria-label="Quitar">&times;</button>
                </div>
            `;
        }).join('');
    }

    removeExerciseFromRoutine(exId) {
        this.selectedExercises = this.selectedExercises.filter(e => e !== exId);
        this.renderRoutineExercises();
    }

    // ——— Exercise Picker ———
    showExercisePicker() {
        this.tempPickerSelection = [...this.selectedExercises];
        this.renderExerciseCatalog();
        this.showView('view-exercise-picker');
        document.getElementById('header-title').textContent = 'Añadir Ejercicios';
        document.getElementById('exercise-search').value = '';
    }

    closeExercisePicker() {
        this.showView('view-edit-routine');
        document.getElementById('header-title').textContent = this.editingRoutineId ? 'Editar Rutina' : 'Nueva Rutina';
    }

    confirmExercisePicker() {
        this.selectedExercises = [...this.tempPickerSelection];
        this.renderRoutineExercises();
        this.closeExercisePicker();
    }

    toggleExerciseSelection(exId) {
        const idx = this.tempPickerSelection.indexOf(exId);
        if (idx === -1) {
            this.tempPickerSelection.push(exId);
        } else {
            this.tempPickerSelection.splice(idx, 1);
        }
        this.renderExerciseCatalog(document.getElementById('exercise-search').value);
    }

    filterExercises(query) {
        this.renderExerciseCatalog(query);
    }

    renderExerciseCatalog(filter = '') {
        const container = document.getElementById('exercise-catalog');
        const lowerFilter = filter.toLowerCase();
        const filtered = EXERCISE_CATALOG.filter(e =>
            !lowerFilter || e.name.toLowerCase().includes(lowerFilter) || e.muscle.toLowerCase().includes(lowerFilter)
        );

        // Group by muscle
        const groups = {};
        filtered.forEach(e => {
            if (!groups[e.muscle]) groups[e.muscle] = [];
            groups[e.muscle].push(e);
        });

        let html = '';
        for (const [muscle, exercises] of Object.entries(groups)) {
            html += `<div class="muscle-group-title">${muscle}</div>`;
            exercises.forEach(e => {
                const selected = this.tempPickerSelection.includes(e.id);
                html += `
                    <button class="exercise-option ${selected ? 'selected' : ''}" onclick="app.toggleExerciseSelection('${e.id}')">
                        <span class="check-circle"></span>
                        ${this.esc(e.name)}
                    </button>
                `;
            });
        }

        container.innerHTML = html || '<div style="text-align:center; color: var(--text-secondary); padding: 40px;">No se encontraron ejercicios</div>';
    }

    // ——— Training ———
    renderTrainSelect() {
        const container = document.getElementById('train-routines-list');
        if (!this.routines.length) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.routines.map(r => {
            const count = r.exercises.length;
            return `
                <div class="glass-card train-card" onclick="app.startWorkout('${r.id}')">
                    <div>
                        <div class="card-title">${this.esc(r.name)}</div>
                        <div class="card-subtitle">${count} ejercicio${count !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    startWorkout(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        this.activeWorkout = {
            routineId: routine.id,
            routineName: routine.name,
            exercises: routine.exercises.map(exId => ({
                exerciseId: exId,
                sets: [{ weight: '', reps: '', completed: false }]
            }))
        };
        this.workoutStartTime = Date.now();

        document.getElementById('train-select').classList.add('hidden');
        document.getElementById('train-active').classList.remove('hidden');
        document.getElementById('workout-routine-name').textContent = routine.name;

        // Start elapsed timer
        this.workoutTimerInterval = setInterval(() => this.updateWorkoutTimer(), 1000);

        this.renderWorkoutExercises();
    }

    updateWorkoutTimer() {
        if (!this.workoutStartTime) return;
        const elapsed = Math.floor((Date.now() - this.workoutStartTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('workout-elapsed').textContent = `${mins}:${secs}`;
    }

    renderWorkoutExercises() {
        const container = document.getElementById('workout-exercises');
        if (!this.activeWorkout) return;

        container.innerHTML = this.activeWorkout.exercises.map((ex, exIdx) => {
            const cat = EXERCISE_CATALOG.find(c => c.id === ex.exerciseId);
            const name = cat ? cat.name : ex.exerciseId;

            const setsHtml = ex.sets.map((set, setIdx) => `
                <div class="set-row ${set.completed ? 'completed' : ''}" id="set-${exIdx}-${setIdx}">
                    <div class="set-number">${setIdx + 1}</div>
                    <input type="number" placeholder="kg" value="${set.weight}" min="0" step="0.5"
                        onchange="app.updateSet(${exIdx}, ${setIdx}, 'weight', this.value)"
                        onfocus="this.select()">
                    <input type="number" placeholder="reps" value="${set.reps}" min="0"
                        onchange="app.updateSet(${exIdx}, ${setIdx}, 'reps', this.value)"
                        onfocus="this.select()">
                    <button class="set-check-btn ${set.completed ? 'checked' : ''}"
                        onclick="app.toggleSetComplete(${exIdx}, ${setIdx})">
                        ✓
                    </button>
                </div>
            `).join('');

            return `
                <div class="glass-card workout-exercise-card" id="workout-ex-${exIdx}">
                    <div class="ex-name">
                        ${this.esc(name)}
                        <button class="rest-btn" onclick="app.openRestTimer()" title="Temporizador de descanso">⏱</button>
                    </div>
                    <div class="sets-table">
                        <div class="sets-header">
                            <span>Serie</span>
                            <span>Peso</span>
                            <span>Reps</span>
                            <span></span>
                        </div>
                        ${setsHtml}
                    </div>
                    <button class="add-set-btn" onclick="app.addSet(${exIdx})">+ Añadir serie</button>
                </div>
            `;
        }).join('');
    }

    updateSet(exIdx, setIdx, field, value) {
        if (!this.activeWorkout) return;
        this.activeWorkout.exercises[exIdx].sets[setIdx][field] = value;
    }

    toggleSetComplete(exIdx, setIdx) {
        if (!this.activeWorkout) return;
        const set = this.activeWorkout.exercises[exIdx].sets[setIdx];
        set.completed = !set.completed;

        // Update UI directly for snappy feel
        const row = document.getElementById(`set-${exIdx}-${setIdx}`);
        const btn = row.querySelector('.set-check-btn');
        row.classList.toggle('completed', set.completed);
        btn.classList.toggle('checked', set.completed);
        row.querySelector('.set-number').style.background = set.completed ? 'var(--gradient-success)' : '';
        row.querySelector('.set-number').style.color = set.completed ? 'white' : '';

        // Auto open rest timer after completing a set
        if (set.completed) {
            this.openRestTimer();
            this.startRestCountdown();
        }
    }

    addSet(exIdx) {
        if (!this.activeWorkout) return;
        const sets = this.activeWorkout.exercises[exIdx].sets;
        const lastSet = sets[sets.length - 1];
        sets.push({
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false
        });
        this.renderWorkoutExercises();
    }

    finishWorkout() {
        if (!this.activeWorkout) return;
        this.showConfirm('¿Terminar el entrenamiento?', () => {
            this._doFinishWorkout();
        });
    }

    _doFinishWorkout() {
        const duration = Math.floor((Date.now() - this.workoutStartTime) / 1000);

        // Count completed sets and total volume
        let totalSets = 0;
        let totalVolume = 0;
        const exercisesData = this.activeWorkout.exercises.map(ex => {
            const completedSets = ex.sets.filter(s => s.completed);
            totalSets += completedSets.length;
            completedSets.forEach(s => {
                const w = parseFloat(s.weight) || 0;
                const r = parseInt(s.reps) || 0;
                totalVolume += w * r;
            });
            return {
                exerciseId: ex.exerciseId,
                sets: completedSets.map(s => ({
                    weight: parseFloat(s.weight) || 0,
                    reps: parseInt(s.reps) || 0
                }))
            };
        }).filter(ex => ex.sets.length > 0);

        if (exercisesData.length === 0) {
            this.showToast('No completaste ninguna serie');
            return;
        }

        const workout = {
            id: this.uid(),
            routineName: this.activeWorkout.routineName,
            date: Date.now(),
            duration,
            totalSets,
            totalVolume: Math.round(totalVolume),
            exercises: exercisesData
        };

        this.history.unshift(workout);
        this.save('gymtracker_history', this.history);

        // Reset workout
        clearInterval(this.workoutTimerInterval);
        this.activeWorkout = null;
        this.workoutStartTime = null;

        document.getElementById('train-active').classList.add('hidden');
        document.getElementById('train-select').classList.remove('hidden');

        this.showToast('¡Entrenamiento guardado! 💪');
        this.navigate('history');
    }

    // ——— History ———
    renderHistory() {
        const container = document.getElementById('history-list');
        if (!this.history.length) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.history.map(w => {
            const date = new Date(w.date);
            const dateStr = date.toLocaleDateString('es-ES', {
                weekday: 'short', day: 'numeric', month: 'short'
            });
            const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const durMins = Math.floor(w.duration / 60);

            return `
                <div class="glass-card history-card" onclick="app.showHistoryDetail('${w.id}')">
                    <div class="hist-date">${dateStr} · ${timeStr}</div>
                    <div class="hist-name">${this.esc(w.routineName)}</div>
                    <div class="hist-stats">
                        <div class="hist-stat">🕐 <strong>${durMins} min</strong></div>
                        <div class="hist-stat">📊 <strong>${w.totalSets} series</strong></div>
                        <div class="hist-stat">🏋️ <strong>${this.formatVolume(w.totalVolume)}</strong></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showHistoryDetail(id) {
        const workout = this.history.find(w => w.id === id);
        if (!workout) return;

        const date = new Date(workout.date);
        const dateStr = date.toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        const durMins = Math.floor(workout.duration / 60);
        const durSecs = workout.duration % 60;

        let html = `
            <div class="detail-header glass-card">
                <h2>${this.esc(workout.routineName)}</h2>
                <div class="detail-date">${dateStr}</div>
                <div class="detail-duration">Duración: ${durMins}m ${durSecs}s · Volumen: ${this.formatVolume(workout.totalVolume)}</div>
            </div>
        `;

        workout.exercises.forEach(ex => {
            const cat = EXERCISE_CATALOG.find(c => c.id === ex.exerciseId);
            const name = cat ? cat.name : ex.exerciseId;

            html += `
                <div class="glass-card detail-exercise">
                    <h3>${this.esc(name)}</h3>
                    <table class="detail-sets-table">
                        <thead><tr><th>Serie</th><th>Peso (kg)</th><th>Reps</th></tr></thead>
                        <tbody>
                            ${ex.sets.map((s, i) => `
                                <tr><td>${i + 1}</td><td>${s.weight}</td><td>${s.reps}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += `
            <div class="detail-actions">
                <button class="btn btn-outline" onclick="app.showEditHistory('${workout.id}')">✏️ Editar</button>
                <button class="btn btn-ghost" onclick="app.deleteHistory('${workout.id}')" style="color: var(--danger);">🗑️ Eliminar</button>
            </div>
            <button class="btn btn-ghost detail-back-btn" onclick="app.navigate('history')">← Volver al historial</button>
        `;

        document.getElementById('history-detail-content').innerHTML = html;
        this.showView('view-history-detail');
        document.getElementById('header-title').textContent = 'Detalle';
    }

    // ——— History Edit & Delete ———
    deleteHistory(id) {
        this.showConfirm('¿Eliminar este entrenamiento del historial?', () => {
            this.history = this.history.filter(w => w.id !== id);
            this.save('gymtracker_history', this.history);
            this.renderHistory();
            this.updateEmptyStates();
            this.showToast('Entrenamiento eliminado');
            this.navigate('history');
        });
    }

    showEditHistory(id) {
        const workout = this.history.find(w => w.id === id);
        if (!workout) return;

        // Create a deep copy for editing
        this.editingHistoryWorkout = JSON.parse(JSON.stringify(workout));

        this.renderEditHistory();
        this.showView('view-edit-history');
        document.getElementById('header-title').textContent = 'Editar Historial';
    }

    renderEditHistory() {
        if (!this.editingHistoryWorkout) return;
        const w = this.editingHistoryWorkout;

        let html = `<div class="glass-card" style="margin-bottom: 20px; padding: 16px;">
            <h3 style="margin-bottom: 8px;">${this.esc(w.routineName)}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">Puedes modificar el peso y las repeticiones de las series.</p>
        </div>`;

        w.exercises.forEach((ex, exIdx) => {
            const cat = EXERCISE_CATALOG.find(c => c.id === ex.exerciseId);
            const name = cat ? cat.name : ex.exerciseId;

            let setsHtml = ex.sets.map((set, setIdx) => `
                <div class="edit-set-row">
                    <div class="set-number">${setIdx + 1}</div>
                    <input type="number" placeholder="kg" value="${set.weight}" min="0" step="0.5"
                        onchange="app.updateEditHistorySet(${exIdx}, ${setIdx}, 'weight', this.value)"
                        onfocus="this.select()">
                    <input type="number" placeholder="reps" value="${set.reps}" min="0"
                        onchange="app.updateEditHistorySet(${exIdx}, ${setIdx}, 'reps', this.value)"
                        onfocus="this.select()">
                </div>
            `).join('');

            html += `
                <div class="glass-card detail-exercise">
                    <h3 style="margin-bottom: 12px; font-size: 1rem;">${this.esc(name)}</h3>
                    <div style="display: grid; grid-template-columns: 40px 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
                        <div>Sr.</div><div>Peso (kg)</div><div>Reps</div>
                    </div>
                    ${setsHtml}
                </div>
            `;
        });

        html += `
            <div class="detail-actions" style="margin-top: 24px;">
                <button class="btn btn-ghost" onclick="app.showHistoryDetail('${w.id}')">Cancelar</button>
                <button class="btn btn-primary" onclick="app.saveHistoryEdit()">Guardar Cambios</button>
            </div>
        `;

        document.getElementById('edit-history-content').innerHTML = html;
    }

    updateEditHistorySet(exIdx, setIdx, field, value) {
        if (!this.editingHistoryWorkout) return;
        this.editingHistoryWorkout.exercises[exIdx].sets[setIdx][field] = value;
    }

    saveHistoryEdit() {
        if (!this.editingHistoryWorkout) return;

        const w = this.editingHistoryWorkout;
        // Recalculate total volume
        let totalVolume = 0;
        w.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                const weight = parseFloat(s.weight) || 0;
                const reps = parseInt(s.reps) || 0;
                totalVolume += weight * reps;
            });
        });
        w.totalVolume = Math.round(totalVolume);

        // Save to state
        const idx = this.history.findIndex(h => h.id === w.id);
        if (idx !== -1) {
            this.history[idx] = w;
            this.save('gymtracker_history', this.history);
        }

        this.editingHistoryWorkout = null;
        this.showToast('Cambios guardados');
        // Refresh detail view
        this.showHistoryDetail(w.id);
    }

    // ——— Rest Timer ———
    openRestTimer() {
        this.restRemaining = this.restTime;
        this.updateTimerDisplay();
        document.getElementById('rest-timer-modal').classList.remove('hidden');
        document.getElementById('timer-start-btn').textContent = 'Iniciar';
        this.restTimerRunning = false;
    }

    closeRestTimer() {
        document.getElementById('rest-timer-modal').classList.add('hidden');
        this.stopRestCountdown();
    }

    setRestTime(seconds) {
        this.restTime = seconds;
        this.restRemaining = seconds;
        this.stopRestCountdown();
        this.updateTimerDisplay();
        document.getElementById('timer-start-btn').textContent = 'Iniciar';
        this.restTimerRunning = false;
    }

    toggleRestTimer() {
        if (this.restTimerRunning) {
            this.stopRestCountdown();
            document.getElementById('timer-start-btn').textContent = 'Reanudar';
            this.restTimerRunning = false;
        } else {
            this.startRestCountdown();
        }
    }

    startRestCountdown() {
        this.restTimerRunning = true;
        document.getElementById('timer-start-btn').textContent = 'Pausar';

        this.restTimerInterval = setInterval(() => {
            this.restRemaining--;
            this.updateTimerDisplay();

            if (this.restRemaining <= 0) {
                this.stopRestCountdown();
                this.restTimerRunning = false;
                document.getElementById('timer-start-btn').textContent = 'Iniciar';
                this.restRemaining = this.restTime;
                this.updateTimerDisplay();
                // Vibrate if available
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                this.showToast('⏱ ¡Descanso terminado!');
            }
        }, 1000);
    }

    stopRestCountdown() {
        clearInterval(this.restTimerInterval);
        this.restTimerInterval = null;
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.restRemaining / 60).toString().padStart(2, '0');
        const secs = (this.restRemaining % 60).toString().padStart(2, '0');
        document.getElementById('timer-text').textContent = `${mins}:${secs}`;

        // Update ring
        const circumference = 2 * Math.PI * 90; // 565.48
        const progress = this.restRemaining / this.restTime;
        const offset = circumference * (1 - progress);
        document.getElementById('timer-progress').setAttribute('stroke-dashoffset', offset);
    }

    // ——— Progress ———
    renderProgressSelect() {
        const select = document.getElementById('progress-exercise-select');
        // Find all unique exercises from history
        const usedExIds = new Set();
        this.history.forEach(w => w.exercises.forEach(ex => usedExIds.add(ex.exerciseId)));

        if (usedExIds.size === 0) return;

        let optionsHtml = '<option value="">-- Elige un ejercicio --</option>';
        const groups = {};

        usedExIds.forEach(id => {
            const cat = EXERCISE_CATALOG.find(c => c.id === id);
            if (cat) {
                if (!groups[cat.muscle]) groups[cat.muscle] = [];
                groups[cat.muscle].push(cat);
            }
        });

        for (const [muscle, exercises] of Object.entries(groups)) {
            exercises.sort((a, b) => a.name.localeCompare(b.name));
            optionsHtml += `<optgroup label="${muscle}">`;
            exercises.forEach(ex => {
                optionsHtml += `<option value="${ex.id}">${this.esc(ex.name)}</option>`;
            });
            optionsHtml += `</optgroup>`;
        }

        select.innerHTML = optionsHtml;
    }

    setProgressMetric(metric) {
        this.currentProgressMetric = metric;
        document.querySelectorAll('.metric-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.metric === metric);
        });
        this.renderProgressChart();
    }

    renderProgressChart() {
        const select = document.getElementById('progress-exercise-select');
        const exId = select.value;
        const canvas = document.getElementById('progress-canvas');
        const emptyState = document.getElementById('chart-empty');
        const statsRow = document.getElementById('progress-stats');

        if (!exId) {
            emptyState.classList.remove('hidden');
            statsRow.classList.add('hidden');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Collect data points for the selected exercise, chronological order
        const dataPoints = [];

        // Search history backwards (oldest first)
        for (let i = this.history.length - 1; i >= 0; i--) {
            const workout = this.history[i];
            const exData = workout.exercises.find(e => e.exerciseId === exId);

            if (exData && exData.sets.length > 0) {
                const date = new Date(workout.date);
                const dateLabel = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                let maxWeight = 0;
                let volume = 0;

                exData.sets.forEach(s => {
                    const weight = parseFloat(s.weight) || 0;
                    const reps = parseInt(s.reps) || 0;
                    if (weight > maxWeight) maxWeight = weight;
                    volume += weight * reps;
                });

                dataPoints.push({
                    dateLabel,
                    weight: maxWeight,
                    volume: Math.round(volume),
                    rawDate: workout.date
                });
            }
        }

        if (dataPoints.length === 0) {
            emptyState.classList.remove('hidden');
            statsRow.classList.add('hidden');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        emptyState.classList.add('hidden');
        statsRow.classList.remove('hidden');

        // Render stats
        const values = dataPoints.map(d => d[this.currentProgressMetric]);
        let maxVal = Math.max(...values);
        let currentVal = values[values.length - 1];
        let diffText = '';

        if (values.length > 1) {
            const prevVal = values[values.length - 2];
            const diff = currentVal - prevVal;
            if (diff > 0) diffText = `<span style="color:var(--success); font-size:0.8rem; margin-left:4px;">▲ +${diff}</span>`;
            else if (diff < 0) diffText = `<span style="color:var(--danger); font-size:0.8rem; margin-left:4px;">▼ ${diff}</span>`;
        }

        const unit = this.currentProgressMetric === 'weight' ? 'kg' : 'kg (vol)';
        document.getElementById('progress-stats').innerHTML = `
            <div class="glass-card stat-card">
                <div class="stat-value">${currentVal}<span style="font-size:0.8rem;color:var(--text-secondary);">${unit}</span></div>
                <div class="stat-label">Último ${diffText}</div>
            </div>
            <div class="glass-card stat-card">
                <div class="stat-value">${maxVal}<span style="font-size:0.8rem;color:var(--text-secondary);">${unit}</span></div>
                <div class="stat-label">Récord All-Time</div>
            </div>
        `;

        // Canvas drawing
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (dataPoints.length < 2) {
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '14px ' + getComputedStyle(document.body).fontFamily;
            ctx.textAlign = 'center';
            ctx.fillText('Registra más datos para ver la gráfica', W / 2, H / 2);
            return;
        }

        // Padding
        const padding = { top: 30, right: 30, bottom: 40, left: 50 };
        const graphW = W - padding.left - padding.right;
        const graphH = H - padding.top - padding.bottom;

        // Find min/max for scale
        const minVal = Math.min(...values) * 0.9; // add 10% bottom margin
        const range = (maxVal - minVal) || 1;

        // Draw Axes & Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (graphH * (i / gridLines));
            ctx.moveTo(padding.left, y);
            ctx.lineTo(W - padding.right, y);

            // Y-axis labels
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const val = maxVal - ((maxVal - minVal) * (i / gridLines));
            ctx.fillText(Math.round(val), padding.left - 10, y);
        }
        ctx.stroke();

        // Calculate point coordinates
        const points = dataPoints.map((dp, i) => {
            const x = padding.left + (i * (graphW / (dataPoints.length - 1)));
            const y = padding.top + graphH - ((dp[this.currentProgressMetric] - minVal) / range) * graphH;
            return { x, y, label: dp.dateLabel };
        });

        // Draw Line with Gradient
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            // Smooth curve
            const xc = (points[i].x + points[i - 1].x) / 2;
            const yc = (points[i].y + points[i - 1].y) / 2;
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
            if (i === points.length - 1) {
                ctx.quadraticCurveTo(xc, yc, points[i].x, points[i].y);
            }
        }

        ctx.strokeStyle = '#818cf8'; // accent-1 length
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Fill below line
        ctx.lineTo(points[points.length - 1].x, padding.top + graphH);
        ctx.lineTo(points[0].x, padding.top + graphH);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Points & X-axis labels Let me fix the labels length logic to avoid crowding
        const step = Math.ceil(points.length / 6); // Max 6 labels

        points.forEach((p, i) => {
            // Point
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#1e1e2e'; // bg color
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#c084fc'; // accent-2
            ctx.stroke();

            // Label
            if (i % step === 0 || i === points.length - 1) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(p.label, p.x, padding.top + graphH + 10);
            }
        });
    }

    // ——— Empty States ———
    updateEmptyStates() {
        const toggle = (listId, emptyId, hasItems) => {
            const list = document.getElementById(listId);
            const empty = document.getElementById(emptyId);
            if (list) list.style.display = hasItems ? '' : 'none';
            if (empty) empty.style.display = hasItems ? 'none' : '';
        };

        toggle('routines-list', 'empty-routines', this.routines.length > 0);
        toggle('train-routines-list', 'empty-train', this.routines.length > 0);
        toggle('history-list', 'empty-history', this.history.length > 0);
    }

    // ——— Toast ———
    showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.remove('show');
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ——— Helpers ———
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    formatVolume(vol) {
        if (vol >= 1000) return (vol / 1000).toFixed(1) + 'T kg';
        return vol + ' kg';
    }

    // ——— Custom Confirm ———
    showConfirm(message, callback) {
        this._confirmCallback = callback;
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-modal').classList.remove('hidden');
    }

    acceptConfirm() {
        document.getElementById('confirm-modal').classList.add('hidden');
        if (this._confirmCallback) {
            this._confirmCallback();
            this._confirmCallback = null;
        }
    }

    cancelConfirm() {
        document.getElementById('confirm-modal').classList.add('hidden');
        this._confirmCallback = null;
    }
}

// ——— Initialize ———
const app = new GymTrackerApp();
