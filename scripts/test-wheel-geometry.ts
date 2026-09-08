import assert from 'node:assert/strict';
import { buildWheelGeometry, describeWheelSegmentPath, getWheelTargetRotation } from '../apps/web/src/app/wheel/wheel-geometry';

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

console.log('wheel geometry tests: pass');
