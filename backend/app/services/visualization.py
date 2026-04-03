from app.schemas.visualization import VisualizationDetail, VisualizationSummary


class VisualizationService:
    def list_visualizations(self) -> list[VisualizationSummary]:
        return [
            VisualizationSummary(id="bubble-sort", title="Bubble Sort", description="Step-by-step comparison and swap trace."),
            VisualizationSummary(id="binary-search", title="Binary Search", description="Pointer movement through a sorted array."),
            VisualizationSummary(id="fibonacci-recursion", title="Fibonacci Recursion", description="Recursive tree expansion for Fibonacci calls."),
            VisualizationSummary(id="graph-traversal", title="Graph Traversal", description="Visited-node order for a graph walk."),
        ]

    def get_visualization(self, algorithm_id: str) -> VisualizationDetail:
        builders = {
            "bubble-sort": self._bubble_sort,
            "binary-search": self._binary_search,
            "fibonacci-recursion": self._fibonacci,
            "graph-traversal": self._graph,
        }
        if algorithm_id not in builders:
            raise KeyError(algorithm_id)
        return builders[algorithm_id]()

    def _bubble_sort(self) -> VisualizationDetail:
        array = [64, 34, 25, 12, 22]
        steps = []
        working = array[:]
        step_index = 0
        for i in range(len(working)):
            for j in range(len(working) - i - 1):
                steps.append({"index": step_index, "label": f"Compare indexes {j} and {j + 1}", "state": {"array": working[:], "active": [j, j + 1]}})
                step_index += 1
                if working[j] > working[j + 1]:
                    working[j], working[j + 1] = working[j + 1], working[j]
                    steps.append({"index": step_index, "label": f"Swap indexes {j} and {j + 1}", "state": {"array": working[:], "active": [j, j + 1]}})
                    step_index += 1
        return VisualizationDetail(algorithm="bubble-sort", title="Bubble Sort", description="A comparison-based sorting algorithm.", steps=steps)

    def _binary_search(self) -> VisualizationDetail:
        array = [1, 3, 5, 7, 9, 11, 13]
        target = 11
        left = 0
        right = len(array) - 1
        steps = []
        index = 0
        while left <= right:
            mid = (left + right) // 2
            steps.append({"index": index, "label": "Check midpoint", "state": {"array": array, "left": left, "mid": mid, "right": right, "target": target}})
            index += 1
            if array[mid] == target:
                break
            if array[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return VisualizationDetail(algorithm="binary-search", title="Binary Search", description="Searches a sorted array by repeatedly halving the search space.", steps=steps)

    def _fibonacci(self) -> VisualizationDetail:
        steps = [
            {"index": 0, "label": "Start fib(4)", "state": {"node": "fib(4)", "children": ["fib(3)", "fib(2)"]}},
            {"index": 1, "label": "Expand fib(3)", "state": {"node": "fib(3)", "children": ["fib(2)", "fib(1)"]}},
            {"index": 2, "label": "Expand fib(2)", "state": {"node": "fib(2)", "children": ["fib(1)", "fib(0)"]}},
        ]
        return VisualizationDetail(algorithm="fibonacci-recursion", title="Fibonacci Recursion", description="Shows how recursive Fibonacci calls branch into subproblems.", steps=steps)

    def _graph(self) -> VisualizationDetail:
        steps = [
            {"index": 0, "label": "Visit node 1", "state": {"visited": [1], "frontier": [2, 3]}},
            {"index": 1, "label": "Visit node 2", "state": {"visited": [1, 2], "frontier": [3, 4]}},
            {"index": 2, "label": "Visit node 3", "state": {"visited": [1, 2, 3], "frontier": [4, 5]}},
            {"index": 3, "label": "Visit node 4", "state": {"visited": [1, 2, 3, 4], "frontier": [5]}},
        ]
        return VisualizationDetail(algorithm="graph-traversal", title="Graph Traversal", description="Walks through a graph and records visit order.", steps=steps)
