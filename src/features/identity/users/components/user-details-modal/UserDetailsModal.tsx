import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { User } from "../../models/User";
import { userService } from "../../services/user.service";
import "./UserDetailsModal.css";

interface UserDetailsModalProps {
  visible: boolean;
  title: string;
  user: User | null;
  onHide: () => void;
}

export function UserDetailsModal({
  visible,
  title,
  user,
  onHide,
}: UserDetailsModalProps) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    const loadUserPhoto = async () => {
      if (!visible || !user?.id) return;
      try {
        const photo = await userService.getUserPhoto(user.id);
        if (!cancelled && photo && photo.size > 0) {
          objectUrl = URL.createObjectURL(photo);
          setPhotoPreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setPhotoPreviewUrl(undefined);
      }
    };

    setPhotoPreviewUrl(undefined);
    loadUserPhoto();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, user]);

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";
  const value = (text?: string | number) => text || "-";

  return (
    <Dialog
      header={title}
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {user ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{value(user.name)}</strong>
          </div>
          <div>
            <span>Telefone</span>
            <strong>{value(user.telephone)}</strong>
          </div>
          <div>
            <span>Ativo</span>
            <strong>{user.active ? "Sim" : "Não"}</strong>
          </div>
          <div className="wide">
            <span>Email</span>
            <strong>{value(user.email)}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(user.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(user.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{value(user.createdBy)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{value(user.updatedBy)}</strong>
          </div>
          <div>
            <span>Rua</span>
            <strong>{value(user.address.street)}</strong>
          </div>
          <div>
            <span>Número</span>
            <strong>{value(user.address.number)}</strong>
          </div>
          <div>
            <span>Complemento</span>
            <strong>{value(user.address.complement)}</strong>
          </div>
          <div>
            <span>Bairro</span>
            <strong>{value(user.address.neighborhood)}</strong>
          </div>
          <div>
            <span>Cidade</span>
            <strong>{value(user.address.city)}</strong>
          </div>
          <div>
            <span>UF</span>
            <strong>{value(user.address.state)}</strong>
          </div>
          <div>
            <span>CEP</span>
            <strong>{value(user.address.zipCode)}</strong>
          </div>
          <div className="wide">
            <span>Perfis</span>
            {user.roles.length > 0 ? (
              user.roles.map((role) => (
                <strong className="role-chip" key={role}>{role}</strong>
              ))
            ) : (
              <strong>-</strong>
            )}
          </div>
          <div className="wide photo">
            <span>Foto</span>
            <strong>
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Foto do usuário"
                  onError={() => setPhotoPreviewUrl(undefined)}
                />
              ) : (
                <span className="photo-placeholder">Sem foto</span>
              )}
            </strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
