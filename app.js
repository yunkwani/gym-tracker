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

        // Confirm callback
        this._confirmCallback = null;

        this.init();
    }

    // ——— Initialization ———
    init() {
        this.renderRoutines();
        this.renderTrainSelect();
        this.renderHistory();
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

        const mainViews = { routines: 'view-routines', train: 'view-train', history: 'view-history' };
        const targetEl = document.getElementById(mainViews[viewName]);
        if (targetEl) {
            targetEl.classList.add('active');
        }

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Update header
        const titles = { routines: 'Mis Rutinas', train: 'Entrenar', history: 'Historial' };
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

        html += `<button class="btn btn-ghost detail-back-btn" onclick="app.navigate('history')">← Volver al historial</button>`;

        document.getElementById('history-detail-content').innerHTML = html;
        this.showView('view-history-detail');
        document.getElementById('header-title').textContent = 'Detalle';
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
