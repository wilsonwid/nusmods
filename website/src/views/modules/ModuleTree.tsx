import * as React from 'react';
import classnames from 'classnames';
import { flatten, values } from 'lodash';
import LinkModuleCodes from 'views/components/LinkModuleCodes';

import { ModuleCode, PrereqTree } from 'types/modules';

import { notNull } from 'types/utils';
import styles from './ModuleTree.scss';

type Props = {
  moduleCode: ModuleCode;
  fulfillRequirements?: readonly ModuleCode[];
  prereqTree?: PrereqTree;
  prerequisiteRule?: string;
};

interface TreeDisplay {
  layer: number;
  node: PrereqTree;
  isPrereq?: boolean;
}

const formatConditional = (name: string) => (name === 'or' ? 'one of' : 'all of');

const nodeName = (node: PrereqTree) => (typeof node === 'string' ? node : Object.keys(node)[0]);

const unwrapLayer = (node: PrereqTree) =>
  typeof node === 'string' ? [node] : flatten(values(node).filter(notNull));

const removeInitial = (node: string) => {
  if (typeof node === 'string') {
    return node
      .substring(46)
      .replace(/COURSES \((\d)\)/g, "$1")
      .replace(/\(/g, "[")
      .replace(/\)/g, "]")
      .replace(/(\d)\s/g, "$1,")
      .replaceAll(" AND ", ",AND,")
      .replaceAll(" OR ", ",OR,")
      .replaceAll(" ", ",")
      .replaceAll(":D", "")
      .split(",")
      .filter((val) => val !== "");
  } else {
    return node;
  } 
} 

const transformArray = (node: PrereqTree | undefined) => {
  if (typeof node === 'string') {
    return node;
  } else {
    return node;
  }
}

const Branch: React.FC<{ nodes: PrereqTree[]; layer: number }> = (props) => (
  <ul className={styles.tree}>
    {props.nodes.map((child) => (
      <li className={styles.branch} key={nodeName(child)}>
        <Tree node={child} layer={props.layer} />
      </li>
    ))}
  </ul>
);

const Tree: React.FC<TreeDisplay> = (props) => {
  const { layer, node, isPrereq } = props;

  const isConditional = typeof node !== 'string';
  const name = nodeName(node);

  return (
    <>
      <div
        className={classnames(styles.node, {
          [`hoverable color-${layer}`]: !isConditional,
          [styles.conditional]: isConditional,
          [styles.prereqNode]: isPrereq,
        })}
      >
        {isConditional ? (
          formatConditional(name)
        ) : (
          <LinkModuleCodes className={styles.link}>{name}</LinkModuleCodes>
        )}
      </div>

      {isConditional && <Branch nodes={unwrapLayer(node)} layer={layer + 1} />}
    </>
  );
};

const ModuleTree: React.FC<Props> = (props) => {
  const { moduleCode, fulfillRequirements, prereqTree, prerequisiteRule } = props;

  console.log(removeInitial(prerequisiteRule));

  return (
    <>
      <div className={styles.container}>
        {fulfillRequirements && fulfillRequirements.length > 0 && (
          <>
            <ul className={styles.prereqTree}>
              {/* {fulfillRequirements.map((fulfilledModule) => (
                <li
                  key={fulfilledModule}
                  className={classnames(styles.branch, styles.prereqBranch)}
                >
                  <Tree layer={0} node={fulfilledModule} isPrereq />
                </li>
              ))} */}
              test
            </ul>

            <div className={classnames(styles.node, styles.conditional)}>needs</div>
          </>
        )}

        <ul className={classnames(styles.tree, styles.root)}>
          <li className={classnames(styles.branch)}>
            <Tree layer={1} node={moduleCode} />

            {prereqTree && <Branch nodes={[prereqTree]} layer={2} />}
          </li>
        </ul>
      </div>

      <p className='alert alert-warning'>
        The prerequisite tree is displayed for visualization purposes and may not be accurate.
        Viewers are encouraged to double check details.
      </p>
    </>
  );
};

export default ModuleTree;
