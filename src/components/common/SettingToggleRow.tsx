import React, { useId } from 'react';
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

interface SettingToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  label,
  description,
  checked,
  onToggle,
  style,
}) => {
  const switchId = useId();

  return (
    <div style={style} className="mt-2.5 first:mt-0">
      <FieldLabel
        htmlFor={switchId}
        className="w-full cursor-pointer select-none bg-card transition-colors hover:border-primary"
      >
        <Field orientation="vertical" className="!gap-1.5 !py-3 !px-3.5">
          <div className="flex items-center gap-3">
            <Switch
              id={switchId}
              checked={checked}
              onCheckedChange={() => onToggle()}
            />
            <FieldTitle>{label}</FieldTitle>
          </div>
          <FieldDescription>{description}</FieldDescription>
        </Field>
      </FieldLabel>
    </div>
  );
};
