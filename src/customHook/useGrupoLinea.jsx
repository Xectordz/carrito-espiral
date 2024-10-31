import { useEffect, useState } from 'react';

export default function useGrupoLinea() {
    const [grupoId, setGrupoId] = useState(() => {
        const storedId = localStorage.getItem("grupoId");
        return storedId ? JSON.parse(storedId) : null;
    });
    
    const [lineaId, setLineaId] = useState(() => {
        const storedId = localStorage.getItem("lineaId");
        return storedId ? JSON.parse(storedId) : null;
    });

    useEffect(() => {
        localStorage.setItem("grupoId", JSON.stringify(grupoId));
    }, [grupoId]);

    useEffect(() => {
        localStorage.setItem("lineaId", JSON.stringify(lineaId));
    }, [lineaId]);

    return {
        grupoId,
        setGrupoId,
        lineaId,
        setLineaId
    };
}



