import assert from 'node:assert/strict';
import { buildWheelGeometry, describeWheelSegmentPath, getWheelTargetRotation } from '../apps/web/src/app/wheel/wheel-geometry';
import { buildFixedWheelPrizes } from '../apps/web/src/app/wheel/wheel-groups';

function closeTo(actual: number, expected: number, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not close to ${expected}`);
}

function testWeights(weights: number[], expectedSweeps: number[]) {
  const geometry = buildWheelGeometry(weights.map((weight, index) => ({
    id: String(index),
    probabilityWeight: weight,
    displayWeight: weight,
  })));

  closeTo(geometry.segments.reduce((sum, segment) => sum + segment.sweepAngle, 0), 360);
  geometry.segments.forEach((segment, index) => {
    closeTo(segment.sweepAngle, expectedSweeps[index]);
    closeTo(segment.centerAngle, segment.startAngle + segment.sweepAngle / 2);
    assert.equal(getWheelTargetRotation(segment.centerAngle), (360 - segment.centerAngle) % 360);
    assert.match(describeWheelSegmentPath(segment), /^M 500 500 L /);
  });
}

testWeights([40, 45, 15], [144, 162, 54]);
testWeights([80, 10, 10], [288, 36, 36]);
testWeights([5, 5, 90], [18, 18, 324]);

const separatedDisplay = buildWheelGeometry([
  { id: 'gift', probabilityWeight: 80, displayWeight: 40 },
  { id: 'peach', probabilityWeight: 10, displayWeight: 45 },
  { id: 'nothing', probabilityWeight: 10, displayWeight: 15 },
]);
closeTo(separatedDisplay.segments[0].probabilityChance, 0.8);
closeTo(separatedDisplay.segments[0].sweepAngle, 144);
closeTo(separatedDisplay.segments[1].sweepAngle, 162);

const zeroWeights = buildWheelGeometry([
  { id: 'gift', probabilityWeight: 0, displayWeight: 0 },
  { id: 'peach', probabilityWeight: 0, displayWeight: 0 },
  { id: 'nothing', probabilityWeight: 0, displayWeight: 0 },
]);
zeroWeights.segments.forEach((segment) => closeTo(segment.sweepAngle, 120));

const fixedGroups = buildFixedWheelPrizes([
  { id: 'voucher-1', name: 'Voucher', type: 'VOUCHER', groupKey: 'gift', weight: 80, metadata: {} },
  { id: 'points-1', name: 'Points', type: 'POINT', groupKey: 'peach', weight: 10, metadata: {} },
  { id: 'nothing-1', name: 'Nothing', type: 'NOTHING', groupKey: 'nothing', weight: 10, metadata: {} },
], { gift: 80, peach: 10, nothing: 10 });

assert.deepEqual(fixedGroups.map((group) => group.id), ['gift-1', 'peach-1', 'nothing-1', 'gift-2', 'peach-2', 'nothing-2']);
assert.deepEqual(fixedGroups.map((group) => group.groupKey), ['gift', 'peach', 'nothing', 'gift', 'peach', 'nothing']);
assert.deepEqual(fixedGroups.map((group) => group.weight), [40, 5, 5, 40, 5, 5]);
assert.deepEqual(fixedGroups.map((group) => group.metadata?.displayWeight), [1, 1, 1, 1, 1, 1]);

const fixedGroupGeometry = buildWheelGeometry(fixedGroups.map((group) => ({
  id: group.id,
  probabilityWeight: group.weight,
  displayWeight: Number(group.metadata?.displayWeight),
})));
fixedGroupGeometry.segments.forEach((segment) => closeTo(segment.sweepAngle, 60));

console.log('wheel geometry tests: pass');
