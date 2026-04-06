import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  ApiService,
  Alumno,
  Asistencia,
  Aviso,
  AvisoCategoria,
  CreateAsistenciaInput,
  CreateAvisoInput,
  CreateMensajeInput,
  CreateNotaInput,
  Curso,
  Mensaje,
  Nota,
  UpdateAsistenciaInput,
  UpdateAvisoInput,
  UpdateNotaInput,
} from '../core/api.service';
import { AuthService, AuthUser, UserRole } from '../core/auth.service';
import { FormField, ModalService, ModalType } from '../core/modal.service';

type Vista = 'resumen' | 'notas' | 'asistencias' | 'alumnos' | 'cursos' | 'mensajes' | 'perfil';
type TablaPaginada = 'notas' | 'asistencias' | 'alumnos';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  protected readonly navItems: ReadonlyArray<{ id: Vista; label: string }> = [
    { id: 'resumen',     label: 'Resumen' },
    { id: 'notas',       label: 'Notas' },
    { id: 'asistencias', label: 'Asistencias' },
    { id: 'alumnos',     label: 'Alumnos' },
    { id: 'cursos',      label: 'Cursos' },
    { id: 'mensajes',    label: 'Mensajes' },
    { id: 'perfil',      label: 'Perfil' },
  ];
  protected vistaActual: Vista = 'resumen';

  protected role: UserRole = 'ALUMNO';
  protected currentUser: AuthUser | null = null;
  protected selectedAlumnoId: number | null = null;

  protected filtroCursoId: number | null = null;
  protected filtroAlumnoId: number | null = null;
  protected loading = true;
  protected errorMessage = '';
  protected selectedNotaId: number | null = null;
  protected selectedAsistenciaId: number | null = null;
  protected selectedAvisoId: number | null = null;

  private readonly tablePageSize = 8;
  protected notasPage = 1;
  protected asistenciasPage = 1;
  protected alumnosPage = 1;

  protected cursos: Curso[] = [];
  protected alumnos: Alumno[] = [];
  protected notas: Nota[] = [];
  protected asistencias: Asistencia[] = [];
  protected avisos: Aviso[] = [];

  protected mensajes: Mensaje[] = [];
  protected mensajesLoading = false;
  protected mensajesError = '';
  protected expandedMensajeId: number | null = null;
  protected replyText = '';
  protected replySoloProfesor = false;

  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modal: ModalService,
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.role = user.role;
        this.loadData();
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  protected setVista(vista: Vista): void {
    this.vistaActual = vista;
    if (vista === 'mensajes') {
      this.loadMensajes();
    }
  }

  protected loadMensajes(): void {
    this.mensajesLoading = true;
    this.mensajesError = '';
    this.api.getMensajes().subscribe({
      next: (msgs) => {
        this.mensajes = msgs;
        this.mensajesLoading = false;
      },
      error: () => {
        this.mensajesError = 'No se pudieron cargar los mensajes.';
        this.mensajesLoading = false;
      },
    });
  }

  protected toggleExpand(id: number): void {
    this.expandedMensajeId = this.expandedMensajeId === id ? null : id;
    this.replyText = '';
    this.replySoloProfesor = false;
  }

  protected submitReply(padreId: number): void {
    if (!this.replyText.trim()) return;
    const input: CreateMensajeInput = {
      contenido: this.replyText.trim(),
      padreId,
      soloProfesor: this.replySoloProfesor,
    };
    this.api.createMensaje(input).subscribe({
      next: () => {
        this.replyText = '';
        this.replySoloProfesor = false;
        this.loadMensajes();
      },
      error: () => {
        this.mensajesError = 'No se pudo enviar la respuesta.';
      },
    });
  }

  protected deleteMensajeById(id: number): void {
    if (!window.confirm('¿Eliminar este mensaje y todas sus respuestas?')) return;
    this.api.deleteMensaje(id).subscribe({
      next: () => this.loadMensajes(),
      error: () => {
        this.mensajesError = 'No se pudo eliminar el mensaje.';
      },
    });
  }

  protected crearMensaje(): void {
    const destinatarioOptions = this.alumnos.map((a) => ({
      label: a.nombre,
      value: String(a.userId),
    }));
    const cursoOptions = this.cursos.map((c) => ({
      label: c.nombre,
      value: String(c.id),
    }));

    const fields = [
      {
        name: 'destino',
        label: 'Enviar a',
        type: 'select' as const,
        value: 'curso',
        options: [
          { label: 'Un curso completo', value: 'curso' },
          { label: 'Un alumno individual', value: 'alumno' },
        ],
      },
      {
        name: 'cursoId',
        label: 'Curso',
        type: 'select' as const,
        value: cursoOptions[0]?.value ?? '',
        options: cursoOptions,
      },
      {
        name: 'destinatarioId',
        label: 'Alumno',
        type: 'select' as const,
        value: destinatarioOptions[0]?.value ?? '',
        options: destinatarioOptions,
      },
      {
        name: 'contenido',
        label: 'Mensaje',
        type: 'textarea' as const,
        value: '',
        required: true,
        placeholder: 'Escribí tu mensaje...',
      },
    ];

    this.modal
      .open({ type: ModalType.MENSAJE_CREATE, title: 'Nuevo mensaje', fields, submitLabel: 'Enviar' })
      .then((values) => {
        const input: CreateMensajeInput = {
          contenido: values['contenido'],
          ...(values['destino'] === 'curso'
            ? { cursoId: Number(values['cursoId']) }
            : { destinatarioId: Number(values['destinatarioId']) }),
        };
        this.api.createMensaje(input).subscribe({
          next: () => this.loadMensajes(),
          error: () => {
            this.mensajesError = 'No se pudo enviar el mensaje.';
          },
        });
      })
      .catch(() => {});
  }

  protected mensajeDestinoLabel(m: Mensaje): string {
    if (m.curso) return `Curso ${m.curso.nombre}`;
    if (m.destinatario) return m.destinatario.username ?? m.destinatario.email ?? 'Alumno';
    return '';
  }

  protected autorLabel(autor: { username?: string | null; email?: string | null }): string {
    return autor.username ?? autor.email ?? 'Usuario';
  }

  protected get vistaTitle(): string {
    const titles: Record<Vista, string> = {
      resumen: 'Resumen',
      notas: 'Notas',
      asistencias: 'Asistencias',
      alumnos: 'Alumnos',
      cursos: 'Cursos',
      mensajes: 'Mensajes',
      perfil: 'Mi Perfil',
    };
    return titles[this.vistaActual];
  }

  protected get userInitial(): string {
    const name = this.currentUser?.username ?? this.currentUser?.email ?? '?';
    return name.charAt(0).toUpperCase();
  }

  protected applyFilters(): void {
    this.loadData();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected get canWrite(): boolean {
    return this.role === 'DOCENTE';
  }

  protected selectNota(id: number): void {
    this.selectedNotaId = id;
  }

  protected selectAsistencia(id: number): void {
    this.selectedAsistenciaId = id;
  }

  protected get alumnoActivo(): Alumno | undefined {
    return this.alumnos.find((a) => a.id === this.selectedAlumnoId);
  }

  protected get notasVisibles(): ReadonlyArray<Nota> {
    return this.paginate(this.notas, this.notasPage);
  }

  protected get asistenciasVisibles(): ReadonlyArray<Asistencia> {
    return this.paginate(this.asistencias, this.asistenciasPage);
  }

  protected get alumnosVisibles(): ReadonlyArray<Alumno> {
    return this.paginate(this.alumnos, this.alumnosPage);
  }

  protected get avisosVisibles(): ReadonlyArray<Aviso> {
    return this.avisos.slice(0, 3);
  }

  protected get resumenStats(): { totalCursos: number; totalAlumnos: number; totalNotas: number; totalAsistencias: number } {
    return {
      totalCursos: this.cursos.length,
      totalAlumnos: this.alumnos.length,
      totalNotas: this.notas.length,
      totalAsistencias: this.asistencias.length,
    };
  }

  protected userVinculadoLabel(alumno: Alumno): string {
    if (alumno.user?.email) return alumno.user.email;
    if (alumno.user?.username) return alumno.user.username;
    return `Usuario #${alumno.userId}`;
  }

  protected avisoCategoriaLabel(categoria: AvisoCategoria): string {
    if (categoria === 'ACADEMICO') return 'Academico';
    if (categoria === 'ADMINISTRATIVO') return 'Administrativo';
    return 'Institucional';
  }

  protected selectAviso(id: number): void {
    this.selectedAvisoId = id;
  }

  protected get totalPaginasNotas(): number {
    return this.getTotalPages(this.notas.length);
  }

  protected get totalPaginasAsistencias(): number {
    return this.getTotalPages(this.asistencias.length);
  }

  protected get totalPaginasAlumnos(): number {
    return this.getTotalPages(this.alumnos.length);
  }

  protected canPrev(tabla: TablaPaginada): boolean {
    return this.getCurrentPage(tabla) > 1;
  }

  protected canNext(tabla: TablaPaginada): boolean {
    return this.getCurrentPage(tabla) < this.getMaxPage(tabla);
  }

  protected previousPage(tabla: TablaPaginada): void {
    this.setPage(tabla, this.getCurrentPage(tabla) - 1);
  }

  protected nextPage(tabla: TablaPaginada): void {
    this.setPage(tabla, this.getCurrentPage(tabla) + 1);
  }

  protected cursoNombre(cursoId: number): string {
    const curso = this.cursos.find((c) => c.id === cursoId);
    if (!curso) return 'Sin curso';
    return curso.nombre?.trim() || `Curso ${curso.id}`;
  }

  protected cursoLabel(curso: Curso): string {
    return this.cursoNombre(curso.id);
  }

  protected alumnoNombre(alumnoId: number): string {
    return this.alumnos.find((a) => a.id === alumnoId)?.nombre ?? 'Sin alumno';
  }

  protected descripcionNota(descripcion: string): string {
    return descripcion.replace(/^parcial/i, 'Examen');
  }

  protected fechaCorta(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    if (Number.isNaN(fecha.getTime())) return fechaIso;

    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  protected createNota(): void {
    if (!this.canWrite) return;

    const alumno = this.pickAlumnoForForm();
    if (!alumno) {
      this.errorMessage = 'No hay alumno disponible para crear nota';
      return;
    }

    const fields: FormField[] = [
      {
        name: 'valor',
        label: 'Valor (0-100)',
        type: 'number',
        value: 80,
        required: true,
        min: 0,
        max: 100,
      },
      {
        name: 'descripcion',
        label: 'Descripcion',
        type: 'text',
        value: 'Examen 1',
        required: true,
        placeholder: 'ej: Examen 1, Parcial, Tarea 1',
      },
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: this.todayDate(),
        required: true,
      },
    ];

    this.modal
      .open({
        type: ModalType.NOTA_CREATE,
        title: 'Nueva Nota',
        fields,
        submitLabel: 'Crear',
      })
      .then((values) => {
        const payload: CreateNotaInput = {
          valor: Number(values['valor']),
          descripcion: values['descripcion'],
          fecha: values['fecha'],
          alumnoId: alumno.id,
          cursoId: alumno.cursoId,
        };

        this.api.createNota(payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo crear la nota';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected editSelectedNota(): void {
    if (!this.canWrite || !this.selectedNotaId) return;

    const nota = this.notas.find((n) => n.id === this.selectedNotaId);
    if (!nota) return;

    const fields: FormField[] = [
      {
        name: 'valor',
        label: 'Valor (0-100)',
        type: 'number',
        value: nota.valor,
        required: true,
        min: 0,
        max: 100,
      },
      {
        name: 'descripcion',
        label: 'Descripcion',
        type: 'text',
        value: nota.descripcion,
        required: true,
      },
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: nota.fecha.slice(0, 10),
        required: true,
      },
    ];

    this.modal
      .open({
        type: ModalType.NOTA_EDIT,
        title: 'Editar Nota',
        fields,
        submitLabel: 'Actualizar',
      })
      .then((values) => {
        const payload: UpdateNotaInput = {
          valor: Number(values['valor']),
          descripcion: values['descripcion'],
          fecha: values['fecha'],
        };

        this.api.updateNota(nota.id, payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo editar la nota';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected deleteSelectedNota(): void {
    if (!this.canWrite || !this.selectedNotaId) return;
    const nota = this.notas.find((n) => n.id === this.selectedNotaId);
    if (!nota) return;

    const alumno = this.alumnoNombre(nota.alumnoId);
    const ok = window.confirm(
      `Deseas eliminar la nota de ${alumno} (${this.descripcionNota(nota.descripcion)} - ${nota.valor})?`,
    );
    if (!ok) return;

    this.api.deleteNota(this.selectedNotaId).subscribe({
      next: () => {
        this.selectedNotaId = null;
        this.loadData();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar la nota';
      },
    });
  }

  protected createAsistencia(): void {
    if (!this.canWrite) return;

    const alumno = this.pickAlumnoForForm();
    if (!alumno) {
      this.errorMessage = 'No hay alumno disponible para registrar asistencia';
      return;
    }

    const fields: FormField[] = [
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: this.todayDate(),
        required: true,
      },
      {
        name: 'presente',
        label: 'Presente',
        type: 'checkbox',
        value: true,
      },
      {
        name: 'observacion',
        label: 'Observacion (opcional)',
        type: 'textarea',
        value: '',
        placeholder: 'Notas adicionales sobre la asistencia...',
      },
    ];

    this.modal
      .open({
        type: ModalType.ASISTENCIA_CREATE,
        title: 'Registrar Asistencia',
        fields,
        submitLabel: 'Registrar',
      })
      .then((values) => {
        const payload: CreateAsistenciaInput = {
          fecha: values['fecha'],
          presente: values['presente'] === true,
          observacion: values['observacion'] || undefined,
          alumnoId: alumno.id,
          cursoId: alumno.cursoId,
        };

        this.api.createAsistencia(payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo registrar la asistencia';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected editSelectedAsistencia(): void {
    if (!this.canWrite || !this.selectedAsistenciaId) return;

    const asistencia = this.asistencias.find((a) => a.id === this.selectedAsistenciaId);
    if (!asistencia) return;

    const fields: FormField[] = [
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: asistencia.fecha.slice(0, 10),
        required: true,
      },
      {
        name: 'presente',
        label: 'Presente',
        type: 'checkbox',
        value: asistencia.presente,
      },
      {
        name: 'observacion',
        label: 'Observacion (opcional)',
        type: 'textarea',
        value: asistencia.observacion ?? '',
        placeholder: 'Notas adicionales sobre la asistencia...',
      },
    ];

    this.modal
      .open({
        type: ModalType.ASISTENCIA_EDIT,
        title: 'Editar Asistencia',
        fields,
        submitLabel: 'Actualizar',
      })
      .then((values) => {
        const payload: UpdateAsistenciaInput = {
          fecha: values['fecha'],
          presente: values['presente'] === true,
          observacion: values['observacion'] || undefined,
        };

        this.api.updateAsistencia(asistencia.id, payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo editar la asistencia';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected deleteSelectedAsistencia(): void {
    if (!this.canWrite || !this.selectedAsistenciaId) return;
    const asistencia = this.asistencias.find((a) => a.id === this.selectedAsistenciaId);
    if (!asistencia) return;

    const alumno = this.alumnoNombre(asistencia.alumnoId);
    const ok = window.confirm(
      `Deseas eliminar la asistencia de ${alumno} del ${this.fechaCorta(asistencia.fecha)}?`,
    );
    if (!ok) return;

    this.api.deleteAsistencia(this.selectedAsistenciaId).subscribe({
      next: () => {
        this.selectedAsistenciaId = null;
        this.loadData();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar la asistencia';
      },
    });
  }

  protected createAviso(): void {
    if (!this.canWrite) return;

    const fields: FormField[] = [
      {
        name: 'titulo',
        label: 'Titulo',
        type: 'text',
        value: '',
        required: true,
        placeholder: 'Ej: Novedad semanal',
      },
      {
        name: 'contenido',
        label: 'Contenido',
        type: 'textarea',
        value: '',
        required: true,
      },
      {
        name: 'categoria',
        label: 'Categoria',
        type: 'select',
        value: 'INSTITUCIONAL',
        options: [
          { label: 'Institucional', value: 'INSTITUCIONAL' },
          { label: 'Administrativo', value: 'ADMINISTRATIVO' },
          { label: 'Academico', value: 'ACADEMICO' },
        ],
      },
      {
        name: 'publicadoDesde',
        label: 'Publicar desde',
        type: 'date',
        value: this.todayDate(),
      },
      {
        name: 'activo',
        label: 'Activo',
        type: 'checkbox',
        value: true,
      },
    ];

    this.modal
      .open({
        type: ModalType.NOTA_CREATE,
        title: 'Nuevo Aviso',
        fields,
        submitLabel: 'Publicar',
      })
      .then((values) => {
        const payload: CreateAvisoInput = {
          titulo: values['titulo'],
          contenido: values['contenido'],
          categoria: values['categoria'] as AvisoCategoria,
          publicadoDesde: values['publicadoDesde'],
          activo: values['activo'] === true,
        };

        this.api.createAviso(payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo crear el aviso';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected editSelectedAviso(): void {
    if (!this.canWrite || !this.selectedAvisoId) return;

    const aviso = this.avisos.find((a) => a.id === this.selectedAvisoId);
    if (!aviso) return;

    const fields: FormField[] = [
      {
        name: 'titulo',
        label: 'Titulo',
        type: 'text',
        value: aviso.titulo,
        required: true,
      },
      {
        name: 'contenido',
        label: 'Contenido',
        type: 'textarea',
        value: aviso.contenido,
        required: true,
      },
      {
        name: 'categoria',
        label: 'Categoria',
        type: 'select',
        value: aviso.categoria,
        options: [
          { label: 'Institucional', value: 'INSTITUCIONAL' },
          { label: 'Administrativo', value: 'ADMINISTRATIVO' },
          { label: 'Academico', value: 'ACADEMICO' },
        ],
      },
      {
        name: 'publicadoDesde',
        label: 'Publicar desde',
        type: 'date',
        value: aviso.publicadoDesde.slice(0, 10),
      },
      {
        name: 'activo',
        label: 'Activo',
        type: 'checkbox',
        value: aviso.activo,
      },
    ];

    this.modal
      .open({
        type: ModalType.NOTA_EDIT,
        title: 'Editar Aviso',
        fields,
        submitLabel: 'Actualizar',
      })
      .then((values) => {
        const payload: UpdateAvisoInput = {
          titulo: values['titulo'],
          contenido: values['contenido'],
          categoria: values['categoria'] as AvisoCategoria,
          publicadoDesde: values['publicadoDesde'],
          activo: values['activo'] === true,
        };

        this.api.updateAviso(aviso.id, payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo editar el aviso';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected deleteSelectedAviso(): void {
    if (!this.canWrite || !this.selectedAvisoId) return;

    const aviso = this.avisos.find((a) => a.id === this.selectedAvisoId);
    if (!aviso) return;

    const ok = window.confirm(`Deseas eliminar el aviso "${aviso.titulo}"?`);
    if (!ok) return;

    this.api.deleteAviso(aviso.id).subscribe({
      next: () => {
        this.selectedAvisoId = null;
        this.loadData();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el aviso';
      },
    });
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private pickAlumnoForForm(): Alumno | undefined {
    if (this.filtroAlumnoId) {
      return this.alumnos.find((a) => a.id === this.filtroAlumnoId);
    }

    return this.alumnos[0];
  }

  private paginate<T>(items: T[], page: number): ReadonlyArray<T> {
    const start = (page - 1) * this.tablePageSize;
    return items.slice(start, start + this.tablePageSize);
  }

  private getTotalPages(totalItems: number): number {
    return Math.max(1, Math.ceil(totalItems / this.tablePageSize));
  }

  private getCurrentPage(tabla: TablaPaginada): number {
    if (tabla === 'notas') return this.notasPage;
    if (tabla === 'asistencias') return this.asistenciasPage;
    return this.alumnosPage;
  }

  private getMaxPage(tabla: TablaPaginada): number {
    if (tabla === 'notas') return this.totalPaginasNotas;
    if (tabla === 'asistencias') return this.totalPaginasAsistencias;
    return this.totalPaginasAlumnos;
  }

  private setPage(tabla: TablaPaginada, page: number): void {
    const clamped = Math.min(Math.max(1, page), this.getMaxPage(tabla));

    if (tabla === 'notas') {
      this.notasPage = clamped;
      return;
    }

    if (tabla === 'asistencias') {
      this.asistenciasPage = clamped;
      return;
    }

    this.alumnosPage = clamped;
  }

  private syncPages(): void {
    this.notasPage = Math.min(this.notasPage, this.totalPaginasNotas);
    this.asistenciasPage = Math.min(this.asistenciasPage, this.totalPaginasAsistencias);
    this.alumnosPage = Math.min(this.alumnosPage, this.totalPaginasAlumnos);

    this.notasPage = Math.max(1, this.notasPage);
    this.asistenciasPage = Math.max(1, this.asistenciasPage);
    this.alumnosPage = Math.max(1, this.alumnosPage);
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters = this.role === 'DOCENTE'
      ? { cursoId: this.filtroCursoId, alumnoId: this.filtroAlumnoId }
      : {};

    forkJoin({
      cursos: this.api.getCursos(),
      alumnos: this.api.getAlumnos(this.role === 'DOCENTE' ? this.filtroCursoId : null),
      notas: this.api.getNotas(filters),
      asistencias: this.api.getAsistencias(filters),
      avisos: this.api.getAvisos(),
    }).subscribe({
      next: (res) => {
        this.cursos = res.cursos;
        this.avisos = res.avisos;

        if (this.role === 'ALUMNO' && this.currentUser?.id) {
          const own = res.alumnos.find((a) => a.userId === this.currentUser?.id);
          this.selectedAlumnoId = own?.id ?? null;

          this.alumnos = own ? [own] : [];
          this.notas = this.selectedAlumnoId
            ? res.notas.filter((n) => n.alumnoId === this.selectedAlumnoId)
            : [];
          this.asistencias = this.selectedAlumnoId
            ? res.asistencias.filter((a) => a.alumnoId === this.selectedAlumnoId)
            : [];
        } else {
          this.alumnos = res.alumnos;
          this.notas = res.notas;
          this.asistencias = res.asistencias;
        }

        this.selectedNotaId = this.notas.some((n) => n.id === this.selectedNotaId)
          ? this.selectedNotaId
          : null;
        this.selectedAsistenciaId = this.asistencias.some((a) => a.id === this.selectedAsistenciaId)
          ? this.selectedAsistenciaId
          : null;
        this.selectedAvisoId = this.avisos.some((a) => a.id === this.selectedAvisoId)
          ? this.selectedAvisoId
          : null;

        this.syncPages();

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar los datos. Verifica API y sesion.';
      },
    });
  }
}
