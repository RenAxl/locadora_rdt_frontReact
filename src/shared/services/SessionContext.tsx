import { createContext, ReactNode, useEffect, useState } from "react";
import { authService } from "../../core/auth/services/auth.service";
import { User } from "../../features/identity/users/models/User";
import { UserMapper } from "../../features/identity/users/mappers/user.mapper";
import { userProfileService } from "../../features/identity/users/services/user-profile.service";
import { SystemSetting } from "../../features/settings/system-settings/models/SystemSetting";
import { SystemSettingMapper } from "../../features/settings/system-settings/mappers/system-setting.mapper";
import { systemSettingService } from "../../features/settings/system-settings/services/system-setting.service";

interface SessionData {
  profile: User | null;
  photo: Blob | null;
  setting: SystemSetting;
  updateProfile: (profile: User) => void;
  updatePhoto: (photo: Blob) => void;
  updateSetting: (setting: SystemSetting) => void;
}

export const SessionContext = createContext<SessionData>({
  profile: null,
  photo: null,
  setting: new SystemSetting({ companyName: "RDT Games" }),
  updateProfile: () => {},
  updatePhoto: () => {},
  updateSetting: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [setting, setSetting] = useState(
    new SystemSetting({ companyName: "RDT Games" }),
  );

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const data = await userProfileService.getMe();
        if (active) setProfile(UserMapper.toModel(data));
      } catch {
        // O interceptor HTTP exibe o erro.
      }
    };
    const loadPhoto = async () => {
      try {
        const data = await userProfileService.getMyPhoto();
        if (active) setPhoto(data.size > 0 ? data : null);
      } catch {
        // Um usuário sem foto continua com o ícone padrão.
      }
    };
    const loadSetting = async () => {
      if (!authService.hasAuthority("SYSTEM_SETTING_READ")) return;
      try {
        const data = await systemSettingService.findCurrent();
        if (active) setSetting(SystemSettingMapper.toModel(data));
      } catch {
        // Mantém o nome e o ícone padrão quando a consulta falha.
      }
    };
    loadProfile();
    loadPhoto();
    loadSetting();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        profile,
        photo,
        setting,
        updateProfile: setProfile,
        updatePhoto: setPhoto,
        updateSetting: setSetting,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
