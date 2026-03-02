import { arrayMove, clamp, getInsertIndex, isPermutation } from '../src/components/draggable-list/math'

function assert(name: string, condition: boolean): void {
    if (!condition) {
        throw new Error(name)
    }
}

function run(): void {
    const shouldForceFail = process.argv.includes('--force-fail')

    assert('clamp lower bound', clamp(-2, 0, 10) === 0)
    assert('clamp middle', clamp(5, 0, 10) === 5)
    assert('clamp upper bound', clamp(99, 0, 10) === 10)

    const moved = arrayMove(['a', 'b', 'c', 'd'], 3, 1)
    assert('arrayMove keeps length', moved.length === 4)
    assert('arrayMove expected order', moved.join(',') === 'a,d,b,c')
    assert('arrayMove permutation', isPermutation(['a', 'b', 'c', 'd'], moved, (x) => x))

    const insertTop = getInsertIndex({
        absoluteY: 90,
        listTopY: 100,
        headerHeight: 40,
        scrollY: 0,
        itemOffset: 80,
        itemCount: 6,
    })
    assert('insert index clamps top', insertTop === 0)

    const insertMiddle = getInsertIndex({
        absoluteY: 390,
        listTopY: 100,
        headerHeight: 40,
        scrollY: 0,
        itemOffset: 80,
        itemCount: 6,
    })
    assert('insert index middle', insertMiddle === 3)

    const insertBottom = getInsertIndex({
        absoluteY: 1500,
        listTopY: 100,
        headerHeight: 40,
        scrollY: 0,
        itemOffset: 80,
        itemCount: 6,
    })
    assert('insert index clamps bottom', insertBottom === 5)

    if (shouldForceFail) {
        assert('forced fail', false)
    }

    process.stdout.write('PASS: draggable list math invariants\n')
}

try {
    run()
} catch (error) {
    const message = error instanceof Error ? error.message : 'unknown failure'
    process.stderr.write(`FAIL: ${message}\n`)
    process.exit(1)
}
