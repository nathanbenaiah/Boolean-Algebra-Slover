import React, { useState } from 'react';
import { X, Save, Trash2, Plus, Edit2, Key, Database, Link as LinkIcon } from 'lucide-react';
import type { 
  SidePanelMode, EREntity, ERAttribute, ERRelationship, 
  DFDNode, AttributeType, DataType, RelationshipType, Cardinality, Optionality,
  FlowchartNode, FlowchartConnection
} from '../../types/diagram';

interface SidePanelProps {
  isOpen: boolean;
  mode: SidePanelMode;
  selectedId: string | null;
  // Data getters
  getEntity?: (id: string) => EREntity | undefined;
  getDFDNode?: (id: string) => DFDNode | undefined;
  getRelationship?: (id: string) => ERRelationship | undefined;
  getFlowchartNode?: (id: string) => FlowchartNode | undefined;
  getFlowchartConnection?: (id: string) => FlowchartConnection | undefined;
  // Data updaters
  updateEntity?: (id: string, updates: Partial<EREntity>) => void;
  updateDFDNode?: (id: string, updates: Partial<DFDNode>) => void;
  updateRelationship?: (id: string, updates: Partial<ERRelationship>) => void;
  updateFlowchartNode?: (id: string, updates: Partial<FlowchartNode>) => void;
  updateFlowchartConnection?: (id: string, updates: Partial<FlowchartConnection>) => void;
  deleteEntity?: (id: string) => void;
  deleteDFDNode?: (id: string) => void;
  deleteRelationship?: (id: string) => void;
  deleteFlowchartNode?: (id: string) => void;
  deleteFlowchartConnection?: (id: string) => void;
  // Entity-specific
  addAttribute?: (entityId: string, attribute: ERAttribute) => void;
  updateAttribute?: (entityId: string, attributeId: string, updates: Partial<ERAttribute>) => void;
  deleteAttribute?: (entityId: string, attributeId: string) => void;
  getEntities?: () => EREntity[];
  onClose: () => void;
}

/**
 * Side Panel Component for Detailed Editing
 * Provides form-based editing for entities, attributes, relationships, and DFD elements
 */
const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  mode,
  selectedId,
  getEntity,
  getDFDNode,
  getRelationship,
  getFlowchartNode,
  getFlowchartConnection,
  updateEntity,
  updateDFDNode,
  updateRelationship,
  updateFlowchartNode,
  updateFlowchartConnection,
  deleteEntity,
  deleteDFDNode,
  deleteRelationship,
  deleteFlowchartNode,
  deleteFlowchartConnection,
  addAttribute,
  updateAttribute,
  deleteAttribute,
  getEntities,
  onClose
}) => {
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
  const [newAttribute, setNewAttribute] = useState<Partial<ERAttribute>>({
    name: '',
    type: 'normal',
    dataType: 'VARCHAR',
    isNullable: true,
    isUnique: false
  });

  if (!isOpen || !selectedId) return null;

  const renderEntityEditor = () => {
    const entity = getEntity?.(selectedId);
    if (!entity) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Entity Name</label>
          <input
            type="text"
            value={entity.name}
            onChange={(e) => updateEntity?.(selectedId, { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={entity.description || ''}
            onChange={(e) => updateEntity?.(selectedId, { description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isWeak"
            checked={entity.isWeak}
            onChange={(e) => updateEntity?.(selectedId, { isWeak: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="isWeak" className="text-sm text-gray-700">Weak Entity</label>
        </div>

        {/* Appearance Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Appearance</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={entity.color || '#3b82f6'}
                onChange={(e) => updateEntity?.(selectedId, { color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={entity.color || '#3b82f6'}
                onChange={(e) => updateEntity?.(selectedId, { color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <input
                type="number"
                value={entity.width}
                onChange={(e) => updateEntity?.(selectedId, { width: parseInt(e.target.value) || 160 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="80"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
              <input
                type="number"
                value={entity.height}
                onChange={(e) => updateEntity?.(selectedId, { height: parseInt(e.target.value) || 80 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="60"
                max="400"
              />
            </div>
          </div>
        </div>

        {/* Attributes Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Attributes</h4>
            <button
              onClick={() => {
                if (addAttribute && newAttribute.name) {
                  const attr: ERAttribute = {
                    id: `attr-${Date.now()}`,
                    name: newAttribute.name || 'New Attribute',
                    type: (newAttribute.type || 'normal') as AttributeType,
                    dataType: (newAttribute.dataType || 'VARCHAR') as DataType,
                    isNullable: newAttribute.isNullable ?? true,
                    isUnique: newAttribute.isUnique ?? false,
                    size: newAttribute.size,
                    defaultValue: newAttribute.defaultValue,
                    description: newAttribute.description
                  };
                  addAttribute(selectedId, attr);
                  setNewAttribute({ name: '', type: 'normal', dataType: 'VARCHAR', isNullable: true, isUnique: false });
                }
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* New Attribute Form */}
          <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
            <input
              type="text"
              placeholder="Attribute name"
              value={newAttribute.name || ''}
              onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newAttribute.type || 'normal'}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value as AttributeType }))}
                className="px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="normal">Normal</option>
                <option value="primary-key">Primary Key</option>
                <option value="foreign-key">Foreign Key</option>
                <option value="composite">Composite</option>
                <option value="multi-valued">Multi-valued</option>
                <option value="derived">Derived</option>
              </select>
              <select
                value={newAttribute.dataType || 'VARCHAR'}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, dataType: e.target.value as DataType }))}
                className="px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="VARCHAR">VARCHAR</option>
                <option value="INT">INT</option>
                <option value="BIGINT">BIGINT</option>
                <option value="DECIMAL">DECIMAL</option>
                <option value="DATE">DATE</option>
                <option value="DATETIME">DATETIME</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="TEXT">TEXT</option>
              </select>
            </div>
          </div>

          {/* Attributes List */}
          <div className="space-y-2">
            {entity.attributes.map((attr) => (
              <div
                key={attr.id}
                className="bg-white border border-gray-200 rounded-lg p-2 hover:border-blue-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {attr.type === 'primary-key' && <Key size={14} className="text-yellow-600" />}
                      {attr.type === 'foreign-key' && <LinkIcon size={14} className="text-blue-600" />}
                      <span className="text-sm font-medium text-gray-900">{attr.name}</span>
                      <span className="text-xs text-gray-500">({attr.dataType})</span>
                    </div>
                    {attr.description && (
                      <p className="text-xs text-gray-500 mt-1">{attr.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingAttribute(editingAttribute === attr.id ? null : attr.id)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteAttribute?.(selectedId, attr.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Attribute Edit Form */}
                {editingAttribute === attr.id && (
                  <div className="mt-2 pt-2 border-t space-y-2">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateAttribute?.(selectedId, attr.id, { name: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={attr.type}
                        onChange={(e) => updateAttribute?.(selectedId, attr.id, { type: e.target.value as AttributeType })}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="normal">Normal</option>
                        <option value="primary-key">Primary Key</option>
                        <option value="foreign-key">Foreign Key</option>
                        <option value="composite">Composite</option>
                        <option value="multi-valued">Multi-valued</option>
                        <option value="derived">Derived</option>
                      </select>
                      <select
                        value={attr.dataType}
                        onChange={(e) => updateAttribute?.(selectedId, attr.id, { dataType: e.target.value as DataType })}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="INT">INT</option>
                        <option value="BIGINT">BIGINT</option>
                        <option value="DECIMAL">DECIMAL</option>
                        <option value="DATE">DATE</option>
                        <option value="DATETIME">DATETIME</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="TEXT">TEXT</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-1 text-xs">
                        <input
                          type="checkbox"
                          checked={attr.isNullable}
                          onChange={(e) => updateAttribute?.(selectedId, attr.id, { isNullable: e.target.checked })}
                          className="rounded"
                        />
                        <span>Nullable</span>
                      </label>
                      <label className="flex items-center space-x-1 text-xs">
                        <input
                          type="checkbox"
                          checked={attr.isUnique}
                          onChange={(e) => updateAttribute?.(selectedId, attr.id, { isUnique: e.target.checked })}
                          className="rounded"
                        />
                        <span>Unique</span>
                      </label>
                    </div>
                    {attr.type === 'foreign-key' && (
                      <select
                        value={attr.foreignKeyRef || ''}
                        onChange={(e) => updateAttribute?.(selectedId, attr.id, { foreignKeyRef: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="">Select reference...</option>
                        {getEntities?.().map(e => 
                          e.attributes
                            .filter(a => a.type === 'primary-key')
                            .map(a => (
                              <option key={`${e.id}.${a.id}`} value={`${e.id}.${a.id}`}>
                                {e.name}.{a.name}
                              </option>
                            ))
                        )}
                      </select>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this entity?')) {
              deleteEntity?.(selectedId);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 size={16} />
          <span>Delete Entity</span>
        </button>
      </div>
    );
  };

  const renderRelationshipEditor = () => {
    const relationship = getRelationship?.(selectedId);
    if (!relationship) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Name</label>
          <input
            type="text"
            value={relationship.name}
            onChange={(e) => updateRelationship?.(selectedId, { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Type</label>
          <select
            value={relationship.type}
            onChange={(e) => updateRelationship?.(selectedId, { type: e.target.value as RelationshipType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="one-to-one">One-to-One (1:1)</option>
            <option value="one-to-many">One-to-Many (1:M)</option>
            <option value="many-to-many">Many-to-Many (M:M)</option>
          </select>
        </div>

        {/* Appearance Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Appearance</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={relationship.color || '#6b7280'}
                onChange={(e) => updateRelationship?.(selectedId, { color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={relationship.color || '#6b7280'}
                onChange={(e) => updateRelationship?.(selectedId, { color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#6b7280"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Cardinality</label>
            <select
              value={relationship.fromCardinality}
              onChange={(e) => updateRelationship?.(selectedId, { fromCardinality: e.target.value as Cardinality })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="0">Zero (0)</option>
              <option value="1">One (1)</option>
              <option value="many">Many</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Cardinality</label>
            <select
              value={relationship.toCardinality}
              onChange={(e) => updateRelationship?.(selectedId, { toCardinality: e.target.value as Cardinality })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="0">Zero (0)</option>
              <option value="1">One (1)</option>
              <option value="many">Many</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Optionality</label>
            <select
              value={relationship.fromOptionality}
              onChange={(e) => updateRelationship?.(selectedId, { fromOptionality: e.target.value as Optionality })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="mandatory">Mandatory</option>
              <option value="optional">Optional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Optionality</label>
            <select
              value={relationship.toOptionality}
              onChange={(e) => updateRelationship?.(selectedId, { toOptionality: e.target.value as Optionality })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="mandatory">Mandatory</option>
              <option value="optional">Optional</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isIdentifying"
            checked={relationship.isIdentifying}
            onChange={(e) => updateRelationship?.(selectedId, { isIdentifying: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="isIdentifying" className="text-sm text-gray-700">Identifying Relationship</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={relationship.description || ''}
            onChange={(e) => updateRelationship?.(selectedId, { description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this relationship?')) {
              deleteRelationship?.(selectedId);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 size={16} />
          <span>Delete Relationship</span>
        </button>
      </div>
    );
  };

  const renderFlowchartNodeEditor = () => {
    const node = getFlowchartNode?.(selectedId);
    if (!node) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => updateFlowchartNode?.(selectedId, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={node.type}
            onChange={(e) => updateFlowchartNode?.(selectedId, { type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option value="start">Start</option>
            <option value="end">End</option>
            <option value="process">Process</option>
            <option value="decision">Decision</option>
            <option value="input-output">Input/Output</option>
            <option value="predefined-process">Predefined Process</option>
            <option value="connector">Connector</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={node.description || ''}
            onChange={(e) => updateFlowchartNode?.(selectedId, { description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Appearance Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Appearance</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={node.color || '#e0f2fe'}
                onChange={(e) => updateFlowchartNode?.(selectedId, { color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={node.color || '#e0f2fe'}
                onChange={(e) => updateFlowchartNode?.(selectedId, { color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#e0f2fe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <input
                type="number"
                value={node.width}
                onChange={(e) => updateFlowchartNode?.(selectedId, { width: parseInt(e.target.value) || 120 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="60"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
              <input
                type="number"
                value={node.height}
                onChange={(e) => updateFlowchartNode?.(selectedId, { height: parseInt(e.target.value) || 80 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="40"
                max="400"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this element?')) {
              deleteFlowchartNode?.(selectedId);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 size={16} />
          <span>Delete Element</span>
        </button>
      </div>
    );
  };

  const renderFlowchartConnectionEditor = () => {
    const connection = getFlowchartConnection?.(selectedId);
    if (!connection) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
          <input
            type="text"
            value={connection.label || ''}
            onChange={(e) => updateFlowchartConnection?.(selectedId, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Connection label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
          <select
            value={connection.style || 'solid'}
            onChange={(e) => updateFlowchartConnection?.(selectedId, { style: e.target.value as 'solid' | 'dashed' | 'dotted' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>

        {/* Appearance Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Appearance</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={connection.color || '#6b7280'}
                onChange={(e) => updateFlowchartConnection?.(selectedId, { color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={connection.color || '#6b7280'}
                onChange={(e) => updateFlowchartConnection?.(selectedId, { color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#6b7280"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this connection?')) {
              deleteFlowchartConnection?.(selectedId);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 size={16} />
          <span>Delete Connection</span>
        </button>
      </div>
    );
  };

  const renderDFDNodeEditor = () => {
    const node = getDFDNode?.(selectedId);
    if (!node) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => updateDFDNode?.(selectedId, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {node.type === 'process' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Process Number</label>
            <input
              type="number"
              value={node.processNumber || ''}
              onChange={(e) => updateDFDNode?.(selectedId, { processNumber: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={node.description || ''}
            onChange={(e) => updateDFDNode?.(selectedId, { description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Appearance Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Appearance</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={node.color || '#8b5cf6'}
                onChange={(e) => updateDFDNode?.(selectedId, { color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={node.color || '#8b5cf6'}
                onChange={(e) => updateDFDNode?.(selectedId, { color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <input
                type="number"
                value={node.width}
                onChange={(e) => updateDFDNode?.(selectedId, { width: parseInt(e.target.value) || 120 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="60"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
              <input
                type="number"
                value={node.height}
                onChange={(e) => updateDFDNode?.(selectedId, { height: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="40"
                max="400"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this element?')) {
              deleteDFDNode?.(selectedId);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 size={16} />
          <span>Delete Element</span>
        </button>
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'entity' && 'Entity Properties'}
            {mode === 'relationship' && 'Relationship Properties'}
            {(mode === 'process' || mode === 'data-store' || mode === 'external-entity') && 'DFD Element Properties'}
            {mode === 'flowchart-node' && 'Flowchart Node Properties'}
            {mode === 'flowchart-connection' && 'Flowchart Connection Properties'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {mode === 'entity' && renderEntityEditor()}
        {mode === 'relationship' && renderRelationshipEditor()}
        {(mode === 'process' || mode === 'data-store' || mode === 'external-entity') && renderDFDNodeEditor()}
        {mode === 'flowchart-node' && renderFlowchartNodeEditor()}
        {mode === 'flowchart-connection' && renderFlowchartConnectionEditor()}
      </div>
    </div>
  );
};

export default SidePanel;

