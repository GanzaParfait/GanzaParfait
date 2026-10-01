"use client";

import { useMemo } from "react";
import { RiArrowDownLine, RiArrowUpLine } from "react-icons/ri";
import type { Project } from "@/data/site-data";
import { isProjectListed } from "@/lib/projects";

function hiddenReason(project: Project) {
  if (project.status === "archived") return "archived, hidden";
  const visibility = project.visibility || "public";
  if (visibility !== "public") return `${visibility}, hidden`;
  return "";
}

export default function ProjectOrderPicker({
  catalog,
  selectedIds,
  onChange,
  legend,
  hint,
  max,
}: {
  catalog: Project[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  legend: string;
  hint: string;
  max?: number;
}) {
  const options = useMemo(() => {
    const listed = catalog.filter((project) => isProjectListed(project) || selectedIds.includes(project.id));
    const byId = new Map(listed.map((project) => [project.id, project]));
    const chosen = selectedIds.map((id) => byId.get(id)).filter((project): project is Project => Boolean(project));
    const rest = listed.filter((project) => !selectedIds.includes(project.id));
    return { chosen, rest };
  }, [catalog, selectedIds]);

  const full = typeof max === "number" && options.chosen.filter(isProjectListed).length >= max;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    if (full) return;
    onChange([...selectedIds, id]);
  };

  const move = (id: string, direction: -1 | 1) => {
    const index = selectedIds.indexOf(id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= selectedIds.length) return;
    const copy = [...selectedIds];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  return (
    <fieldset className="hp-field">
      <legend>{legend}</legend>
      <small>{hint}</small>
      <ul className="svc-pick-list">
        {options.chosen.map((project, index) => {
          const reason = hiddenReason(project);
          return (
            <li key={project.id}>
              <label>
                <input type="checkbox" checked onChange={() => toggle(project.id)} />
                <span>
                  {String(index + 1).padStart(2, "0")} {project.title}
                  {reason ? <em className="svc-pick-note"> ({reason})</em> : null}
                </span>
              </label>
              <span className="svc-pick-moves">
                <button type="button" aria-label={`Move ${project.title} earlier`} disabled={index === 0} onClick={() => move(project.id, -1)}>
                  <RiArrowUpLine size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${project.title} later`}
                  disabled={index === options.chosen.length - 1}
                  onClick={() => move(project.id, 1)}
                >
                  <RiArrowDownLine size={16} />
                </button>
              </span>
            </li>
          );
        })}
        {options.rest.map((project) => (
          <li key={project.id}>
            <label>
              <input type="checkbox" checked={false} disabled={full} onChange={() => toggle(project.id)} />
              <span>{project.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
