import { useState } from "react";
import axios from "axios";

export default function CreatePoll() {
  const [poll, setPoll] = useState({
    poll_name: "",
    description: "",
    start_time: "",
    end_time: "",
  });

  const [positions, setPositions] = useState([]);

  const addPosition = () => {
    setPositions([
      ...positions,
      { position_name: "", max_selectable: 1, candidates: [] },
    ]);
  };

  const addCandidate = (index) => {
    const updated = [...positions];
    updated[index].candidates.push({ name: "" });
    setPositions(updated);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/polls/full",
        { ...poll, positions }
      );
      alert("Poll Created Successfully!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Error creating poll");
    }
  };

 return (
  <div className="min-h-screen bg-gray-100 flex justify-center items-center">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
      
      <h2 className="text-3xl font-bold text-center mb-6">
        Create Poll
      </h2>

      {/* Poll Inputs */}
      <div className="space-y-3">
        <input
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Poll Name"
          onChange={(e) =>
            setPoll({ ...poll, poll_name: e.target.value })
          }
        />

        <input
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Description"
          onChange={(e) =>
            setPoll({ ...poll, description: e.target.value })
          }
        />

        <div className="flex gap-2">
          <input
            type="datetime-local"
            className="w-full p-3 border rounded-lg"
            onChange={(e) =>
              setPoll({
                ...poll,
                start_time: e.target.value + ":00",
              })
            }
          />

          <input
            type="datetime-local"
            className="w-full p-3 border rounded-lg"
            onChange={(e) =>
              setPoll({
                ...poll,
                end_time: e.target.value + ":00",
              })
            }
          />
        </div>
      </div>

      {/* Add Position */}
      <button
        onClick={addPosition}
        className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        + Add Position
      </button>

      {/* Positions */}
      {positions.map((pos, i) => (
        <div key={i} className="mt-4 p-4 border rounded-lg bg-gray-50">
          
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="Position Name"
            onChange={(e) => {
              const updated = [...positions];
              updated[i].position_name = e.target.value;
              setPositions(updated);
            }}
          />

          <button
            onClick={() => addCandidate(i)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mb-2"
          >
            + Add Candidate
          </button>

          {pos.candidates.map((cand, j) => (
            <input
              key={j}
              className="w-full p-2 border rounded mb-1"
              placeholder="Candidate Name"
              onChange={(e) => {
                const updated = [...positions];
                updated[i].candidates[j].name = e.target.value;
                setPositions(updated);
              }}
            />
          ))}
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
      >
        Create Poll
      </button>
    </div>
  </div>
);
}