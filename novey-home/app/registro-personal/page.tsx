'use client';

import { useRouter } from 'next/navigation';
import AuthShell, { TextField, SelectField, RadioGroup, InfoIcon } from '../../components/auth/AuthShell';

// Registro de cuenta personal — Figma "Desktop - cuenta particular" (5579:2759)
export default function RegistroPersonalPage() {
  const router = useRouter();
  return (
    <AuthShell active="personal">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/');
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <h2 className="text-[22px] font-bold leading-7 text-text-primary">Cuenta personal</h2>
          <p className="mt-1 text-[12px] leading-4 text-text-secondary">
            Campos marcados con * son obligatorios.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nombre*" placeholder="Tu nombre" />
          <TextField label="Apellidos*" placeholder="Tus apellidos" />
        </div>

        <SelectField
          label="Género*"
          placeholder="Selecciona"
          options={['Femenino', 'Masculino', 'Prefiero no decirlo']}
        />

        <div className="flex flex-col gap-1.5">
          <RadioGroup
            name="Tipo de identificación"
            options={['Cédula', 'Pasaporte', 'NT']}
            defaultValue="Cédula"
            tip="Elegí el documento con el que vas a comprar"
          />
          <TextField label="Número de identificación*" placeholder="Ej: 8-NNN-NNNN" />
        </div>

        <div className="flex flex-col gap-1.5">
          <RadioGroup
            name="Tipo de teléfono"
            options={['Fijo', 'Celular', 'Oficina']}
            defaultValue="Celular"
            tip="Lo usamos para avisos de tu pedido"
          />
          <TextField label="Número de teléfono*" placeholder="6NNN-NNNN" />
        </div>

        <h3 className="mt-2 text-[15px] font-bold leading-5 text-text-primary">
          Información de inicio de sesión
        </h3>
        <TextField label="Correo electrónico*" placeholder="tu@ejemplo.com" type="email" />
        <TextField label="Contraseña*" placeholder="Mínimo 8 caracteres" type="password" />
        <TextField label="Repetir contraseña*" placeholder="Repite tu contraseña" type="password" />

        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-novey-blue" />
          <span className="text-[12px] leading-4 text-text-primary">
            Quiero recibir ofertas exclusivas, tendencias y novedades por correo electrónico.
          </span>
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-novey bg-novey-blue px-6 py-3 text-[14px] font-semibold leading-5 text-white transition-colors duration-150 hover:bg-novey-blue-dark active:bg-novey-navy sm:w-[160px]"
        >
          Crear cuenta
        </button>
      </form>
    </AuthShell>
  );
}
